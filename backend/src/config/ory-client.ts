import { Configuration, FrontendApi, OAuth2Api } from "@ory/client";

const baseUrlInternal =
  process.env.ORY_SDK_URL || "https://playground.projects.oryapis.com";

const apiBaseFrontendUrlInternal =
  process.env.KRATOS_PUBLIC_URL || baseUrlInternal;

const apiBaseOauth2UrlInternal =
  process.env.HYDRA_PUBLIC_URL || baseUrlInternal;

export const apiBaseUrl =
  process.env.KRATOS_BROWSER_URL || apiBaseFrontendUrlInternal;

const hydraBaseOptions: any = {};

if (process.env.MOCK_TLS_TERMINATION) {
  hydraBaseOptions.headers = { "X-Forwarded-Proto": "https" };
}

// Sets up the SDK
export const sdk = {
  basePath: apiBaseFrontendUrlInternal,
  frontend: new FrontendApi(
    new Configuration({
      basePath: apiBaseFrontendUrlInternal,
    })
  ),
  oauth2: new OAuth2Api(
    new Configuration({
      basePath: apiBaseOauth2UrlInternal,
      baseOptions: hydraBaseOptions,
    })
  ),
};

// Default Config
export const defaultConfig = {
  apiBaseUrl: apiBaseUrl,
  kratosBrowserUrl: apiBaseUrl,
};
