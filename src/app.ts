import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const app: Application = express();


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success:true,
    message:"assignment server",
    author:"Rifat"
  });
});

export default app;
