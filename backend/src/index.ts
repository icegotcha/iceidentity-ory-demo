import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { middleware as middlewareLogger } from "./config/logger";

import createLoginRoutes from "./routes/login";
import createSignupRoutes from "./routes/signup";

dotenv.config();
const port = process.env.PORT || 3001;

const app: Express = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareLogger);

createLoginRoutes(app);
createSignupRoutes(app);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
