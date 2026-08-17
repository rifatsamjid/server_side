import { pool } from "../../db/index.js";
import type { ICreateIssue } from "./createIssues.interface.js";
import type { IUpdateIssue } from "./updateIssues.interface.js";

const createIssuesIntoDB = async (payload: ICreateIssue, reporterId: number) => {
  const { title, description, type } = payload;

  const reporter = await pool.query(
    `
    SELECT id, name, email
    FROM contributor
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
    reporter: reporter.rows[0],
  };
};




export const issuesService = {
    createIssuesIntoDB,
    getAllIssues,getSingleIssue,updateIssue,deleteIssue
}