import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import type { IUser } from "./auth.interface.js";

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

export const authService = {
  createUserIntoDB,
};
