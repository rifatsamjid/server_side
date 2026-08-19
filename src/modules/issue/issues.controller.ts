import type { Request, Response } from "express";
import { issuesService } from "./issues.service.js";
import type { IGetAllIssuesQuery } from "./getAllIssues.interface.js";

const createIssues = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user.id;
    const result = await issuesService.createIssuesIntoDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create issue",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssues(req.query as IGetAllIssuesQuery);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieved issues",
    });
  }
};

const getSingleIssues = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.getSingleIssue(id);

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: "Issue not found",
      error: error,
    });
  }
};

const updateIssues = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issuesService.updateIssue(id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: "Issue update successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update issue",
      error: error,
    });
  }
};

const issueDelete = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const result = await issuesService.deleteIssue(id,req.user)

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: "Issue not found",
      error: error,
    });
  }
};

export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  issueDelete
};
