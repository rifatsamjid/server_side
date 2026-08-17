import { Pool } from "pg";
import config from "../config/env.js";

export const pool = new Pool({
  connectionString:
    config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS contributor(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            role VARCHAR(20) DEFAULT 'contributor',

             created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("Database connection error", error);
  }
};
