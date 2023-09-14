import { Express, NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { isQuerySet } from "../utils";
import { logger } from "../config/logger";
import { appConfig } from "../config/app";
import { sdk, defaultConfig as oryDefaultConfig } from "../config/ory-client";
import { ResponseError } from "../types/error";
declare module "express-session" {
  interface SessionData {
    loginState: String;
  }
}

const redirectToLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    next(Error("Unable to used express-session"));
    return;
  }

  logger.info(
    "Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found."
  );

  const state = crypto.randomBytes(48).toString("hex");
  req.session.loginState = state;
  req.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    console.log(
      "🚀 ~ file: login.ts:35 ~ req.session.save ~ baseUrl:",
      baseUrl
    );
    logger.debug("Return to: ", {
      url: req.url,
      base: baseUrl,
      prot: `${req.protocol}://${req.headers.host}`,
      "kratos.browser": oryDefaultConfig.kratosBrowserUrl,
    });

    const returnTo = new URL(req.url, baseUrl);
    returnTo.searchParams.set("login_state", state);
    logger.debug(`returnTo: "${returnTo.toString()}"`, returnTo);

    logger.debug("new URL: ", [
      oryDefaultConfig.kratosApiBaseUrl + "/self-service/login/browser",
      baseUrl,
    ]);

    const redirectTo = new URL(
      oryDefaultConfig.kratosApiBaseUrl + "/self-service/login/browser",
      baseUrl
    );
    redirectTo.searchParams.set("refresh", "true");
    redirectTo.searchParams.set("return_to", returnTo.toString());

    logger.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo);

    res.redirect(redirectTo.toString());
  });
};

const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      logger.debug("Accepting ORY Hydra Login Request because skip is true");
      return sdk.oauth2
        .acceptOAuth2LoginRequest({
          loginChallenge,
          acceptOAuth2LoginRequest: {
            subject: loginRequest.subject,
          },
        })
        .then(({ data }) => res.redirect(String(data.redirect_to)));
    }

    const hydraLoginState = req.query.login_state;
    if (!isQuerySet(hydraLoginState)) {
      logger.debug(
        "Redirecting to login page because login_state was not found in the HTTP URL query parameters."
      );
      redirectToLogin(req, res, next);
      return;
    }

    const kratosSessionCookie = req.cookies.ory_kratos_session;
    console.log(
      "🚀 ~ file: login.ts:104 ~ kratosSessionCookie:",
      kratosSessionCookie
    );
    if (!kratosSessionCookie) {
      // The state was set but we did not receive a session. Let's retry.
      logger.debug(
        "Redirecting to login page because no ORY Kratos session cookie was set."
      );
      redirectToLogin(req, res, next);
      return;
    }

    if (hydraLoginState !== req.session?.loginState) {
      // States mismatch, retry.
      logger.debug(
        "Redirecting to login page because login states do not match."
      );
      redirectToLogin(req, res, next);
      return;
    }

    //  Get the session
    const { data: session } = await sdk.frontend.toSession({
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
    return res.redirect(String(response.redirect_to));
  } catch (error) {
    next(error);
  }
};

export default (app: Express) => {
  app.get("/oauth/login", loginHandler);
};
