import type { Request, Response } from "express";
import { authService } from "./auth.service.js";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error,
    });
  }
};

const logIn= async(req:Request,res:Response)=>{
    try {
        const result = await authService.logInUserIntoDB(req.body)
        res.status(200).json({
            success:true,
            message:"Login successful",
            data:result
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Login failed",
            error
        })
    }
}

export const authController = {
  createUser,
  logIn
};
