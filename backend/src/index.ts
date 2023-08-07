import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { middleware as middlewareLogger } from "./config/logger";

import createLoginRoutes from "./routes/login";
import createSignupRoutes from "./routes/signup";
import { ResponseError } from "types/error";

dotenv.config();
const port = process.env.PORT || 3001;

const app: Express = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareLogger);

createLoginRoutes(app);
createSignupRoutes(app);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

app.use((err: ResponseError, _: Request, res: Response) => {
  res.status(err.status || 500).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack,
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
