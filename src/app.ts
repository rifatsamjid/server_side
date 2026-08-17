import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import dns from "node:dns";
import net from "node:net";
const app: Application = express();

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "assignment server",
    author: "Rifat",
  });
});

export default app;
