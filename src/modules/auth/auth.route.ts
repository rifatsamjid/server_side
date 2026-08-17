import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.logIn);

export const authRoute = router;
