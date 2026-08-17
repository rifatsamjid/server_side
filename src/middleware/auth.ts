import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { pool } from "../db/index.js";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token is missing",
        });
      }

      const decoded = jwt.verify(token, config.secret as string) as {
        id: number;
        email: string;
        role: "contributor" | "maintainer";
      };
      const result = await pool.query(
        `
        SELECT id, name, email, role, is_active
          FROM users
          WHERE id = $1
        `,
        [decoded.id],
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user?.is_active) {
        return res.status(403).json({
          success: false,
          message: "User account is inactive",
        });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

export default auth;
