import express, { Express, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import { middleware as middlewareLogger } from "./config/logger";

import createLoginRoutes from "./routes/login";
import createSignupRoutes from "./routes/signup";
import { ResponseError } from "./types/error";

dotenv.config();
const port = Number(process.env.PORT) || 3001;

const app: Express = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareLogger);
app.use(
  session({
    secret: "TestSecret",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: config.https.enabled },
  })
);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

createLoginRoutes(app);
createSignupRoutes(app);

app.use((err: ResponseError, _: Request, res: Response) => {
  res.status(err.status || 500).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
