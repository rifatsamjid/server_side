

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import dns from "dns";
import net from "net";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.SECRET
};
var env_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: env_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor'
            CHECK (role IN ('contributor', 'maintainer')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(20) NOT NULL
      CHECK(type IN('bug','feature_request')),
      status VARCHAR(20) NOT NULL DEFAULT 'open'
      CHECK(status IN('open','in_progress','resolved')),
      reporter_id INT NOT NULL,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("Database connection error", error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role = "contributor" } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (role && !["contributor", "maintainer"].includes(role)) {
    throw new Error("Role must be either contributor or maintainer");
  }
  const result = await pool.query(
    `
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
        `,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var logInUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(
    `
       SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, env_default.secret, {
    expiresIn: "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  createUserIntoDB,
  logInUserIntoDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error
    });
  }
};
var logIn = async (req, res) => {
  try {
    const result = await authService.logInUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error
    });
  }
};
var authController = {
  createUser,
  logIn
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.logIn);
var authRoute = router;

// src/modules/issue/issues.route.ts
import { Router as Router2 } from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized"
        });
      }
      const token = authHeader?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token is missing"
        });
      }
      const decoded = jwt2.verify(token, env_default.secret);
      const result = await pool.query(
        `
        SELECT id, name, email, role
          FROM users
          WHERE id = $1
        `,
        [decoded.id]
      );
      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_default = auth;

// src/modules/issue/issues.service.ts
var createIssuesIntoDB = async (payload, reporterId) => {
  const { title, description, status = "open", type } = payload;
  const reporter = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE id=$1
    `,
    [reporterId]
  );
  if (reporter.rows.length === 0) {
    throw new Error("Reporter not found");
  }
  const result = await pool.query(
    `
    INSERT INTO issues
    (title, description, type,status, reporter_id)
      VALUES
        ($1, $2, $3, $4,$5)
      RETURNING *
    `,
    [title, description, type, status, reporterId]
  );
  return {
    ...result.rows[0]
  };
};
var getAllIssues = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `
    SELECT *
    FROM issues
  `;
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const issueResult = await pool.query(sql, values);
  const issues = await Promise.all(
    issueResult.rows.map(async (issue) => {
      const userResult = await pool.query(
        `
          SELECT id, name, email, role
          FROM users
          WHERE id = $1
        `,
        [issue.reporter_id]
      );
      return {
        ...issue,
        reporter: userResult.rows[0] || null
      };
    })
  );
  return issues;
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `
      SELECT id, name, email,role
      FROM users
      WHERE id = $1
    `,
    [issue.reporter_id]
  );
  return {
    ...issue,
    reporter: userResult.rows[0] || null
  };
};
var updateIssue = async (id, payload, user) => {
  const { title, description, type } = payload;
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  if (user.role === "maintainer") {
    const result = await pool.query(
      `
      UPDATE issues
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type)
        WHERE id = $4
        RETURNING *
      `,
      [title, description, type, id]
    );
    return result.rows[0];
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You can only update your own issue");
    }
    if (issue.status !== "open") {
      throw new Error("You can only update an issue when its status is open");
    }
    const result = await pool.query(
      `
        UPDATE issues
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type)
        WHERE id = $4
        RETURNING *
      `,
      [title, description, type, id]
    );
    return result.rows[0];
  }
  throw new Error("You are not authorized to update this issue");
};
var deleteIssue = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Only maintainer can delete an issue");
  }
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var issuesService = {
  createIssuesIntoDB,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const result = await issuesService.createIssuesIntoDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create issue",
      error: error instanceof Error ? error.message : error
    });
  }
};
var getAllIssues2 = async (req, res) => {
  try {
    const result = await issuesService.getAllIssues(req.query);
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieved issues"
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.getSingleIssue(id);
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Issue not found",
      error
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.updateIssue(id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "Issue update successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update issue",
      error
    });
  }
};
var issueDelete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.deleteIssue(id, req.user);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Issue not found",
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues: getAllIssues2,
  getSingleIssues,
  updateIssues,
  issueDelete
};

// src/modules/issue/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssues);
router2.patch("/:id", auth_default(), issuesController.updateIssues);
router2.delete("/:id", auth_default(), issuesController.issueDelete);
var issuesRouter = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server",
    author: "Rifat"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRouter);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(env_default.port, () => {
    console.log(`Example app listening on port ${env_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map