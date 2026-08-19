import { pool } from "../../db/index.js";
import type { ICreateIssue } from "./createIssues.interface.js";
import type { IAuthUser } from "./updateAuth.interface.js";
import type { IUpdateIssue } from "./updateIssues.interface.js";

const createIssuesIntoDB = async (
  payload: ICreateIssue,
  reporterId: number,
) => {
  const { title, description, type } = payload;

  const reporter = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE id=$1 AND is_active=true
    `,
    [reporterId],
  );
  if (reporter.rows.length === 0) {
    throw new Error("Reporter not found");
  }

  const result = await pool.query(
    `
    INSERT INTO issues
    (title, description, type, reporter_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
    `,
    [title, description, type, reporterId],
  );
  return {
    ...result.rows[0],
  };
};

const getAllIssues = async () => {
  const issueResult = await pool.query(`
    SELECT *
    FROM issues
    ORDER BY id DESC
  `);

  const issues = await Promise.all(
    issueResult.rows.map(async (issue) => {
      const userResult = await pool.query(
        `
          SELECT id, name, email
          FROM users
          WHERE id = $1
        `,
        [issue.reporter_id],
      );

      return {
        ...issue,
        reporter: userResult.rows[0] || null,
      };
    }),
  );

  return issues;
};

const getSingleIssue = async (id: number) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
    `,
    [id],
  );

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  const userResult = await pool.query(
    `
      SELECT id, name, email
      FROM users
      WHERE id = $1
    `,
    [issue.reporter_id],
  );

  return {
    ...issue,
    reporter: userResult.rows[0] || null,
  };
};

const updateIssue = async (
  id: number,
  payload: IUpdateIssue,
  user: IAuthUser,
) => {
  const { title, description, type } = payload;

  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
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
      [title, description, type, id],
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
      [title, description, type, id],
    );
    return result.rows[0];
  }
  throw new Error("You are not authorized to update this issue");
};

const deleteIssue = async (id: number) => {
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }

  return result.rows[0];
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
