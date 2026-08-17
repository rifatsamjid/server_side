import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import type { IUser } from "./auth.interface.js";
import jwt from "jsonwebtoken";
import config from "../../config/env.js";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role = "contributor" } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO contributor(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
        `,
    [name, email, hashedPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const logInUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const result = await pool.query(
    `
       SELECT * FROM contributor WHERE email=$1
        `,
    [email],
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
    role: user.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const authService = {
  createUserIntoDB,
  logInUserIntoDB,
};
