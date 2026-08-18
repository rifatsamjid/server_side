import { Router } from "express";
import auth from "../../middleware/auth.js";
import { issuesController } from "./issues.controller.js";

const router = Router();

router.post("/", auth(), issuesController.createIssues);
router.get("/",issuesController.getAllIssues)
router.get("/:id",issuesController)

export const issuesRouter = router;
