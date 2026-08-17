import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import dns from "node:dns";
import net from "node:net";
import { authRoute } from "./modules/auth/auth.route.js";
import { issuesRouter } from "./modules/issue/issues.route.js";
const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "assignment server",
    author: "Rifat",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/issues",issuesRouter)

export default app;
