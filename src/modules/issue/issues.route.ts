import { Router } from "express";
import auth from "../../middleware/auth.js";

const router = Router();

router.post("/",auth,)


export const issuesRouter = router