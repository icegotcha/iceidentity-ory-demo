import { Express, NextFunction, Request, Response } from "express";
import { sdk } from "../config/ory-client";
import { isQuerySet } from "utils";
import { ResponseError } from "types/error";

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loginChallenge = req.query.login_challenge?.toString(); // come from hydra
    if (!isQuerySet(loginChallenge)) {
      const error = new ResponseError("login_challenge is not set", 400);
      next(error);
      return;
    }
    const { data: loginRequest } = await sdk.oauth2.getOAuth2LoginRequest({
      loginChallenge,
    });
    if (loginRequest.skip) {
      // User is already authenticated, simply accept the login request.
      return sdk.oauth2
        .acceptOAuth2LoginRequest({
          loginChallenge,
          acceptOAuth2LoginRequest: {
            subject: loginRequest.subject,
          },
        })
        .then(({ data }) =>
          res.json({ status: "ok", data: { redirect_to: data.redirect_to } })
        );
    }
    //  Get the session
    const { data: session } = await sdk.frontend.toSession({
      xSessionToken: req.headers["X-Session-Token"] as string,
      cookie: req.headers.cookie as string,
    });

    const subject = session.identity.id;

    // User is authenticated, accept the LoginRequest and tell Hydra
    const { data: response } = await sdk.oauth2.acceptOAuth2LoginRequest({
      loginChallenge,
      acceptOAuth2LoginRequest: {
        subject,
        context: session,
      },
    });
    return res.json({
      status: "ok",
      data: { redirect_to: response.redirect_to },
    });
  } catch (error) {
    next(error);
  }
};

export default (app: Express) => {
  app.post("/login", login);
};
