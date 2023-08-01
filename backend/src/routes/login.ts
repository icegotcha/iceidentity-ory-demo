import { Express, Request, Response } from "express";

const login = async (req: Request, res: Response) => {
  // TODO: Add handling login logic
  // ref: https://www.ory.sh/docs/oauth2-oidc/custom-login-consent/flow
  // ref: https://www.ory.sh/docs/kratos/bring-your-own-ui/custom-ui-overview
};

export default (app: Express) => {
  app.post("/login", login);
};
