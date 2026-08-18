import type { Request, Response } from "express";
import { issuesService } from "./issues.service.js";

const createIssues = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user.id;
    const result = await issuesService.createIssuesIntoDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create issue",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssues();

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieved issues",
    });
  }
};

export const issuesController = {
  createIssues,
  getAllIssues,
};
