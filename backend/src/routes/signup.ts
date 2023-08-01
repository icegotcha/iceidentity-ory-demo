import { Express, Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
  // TODO: Add handling signup logic
  // ref: https://www.ory.sh/docs/kratos/self-service
};

export default (app: Express) => {
  app.post("/signup", signup);
};
