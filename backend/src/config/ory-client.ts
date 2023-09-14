import { Configuration, FrontendApi, OAuth2Api } from "@ory/client";

const apiBaseKratosInternalUrl =
  process.env.KRATOS_PRIVATE_URL || "http://localhost:4434";

const apiBaseHydraUrlInternal =
  process.env.HYDRA_PRIVATE_URL || "http://localhost:4445";

const browserBaseUrl =
  process.env.KRATOS_BROWSER_URL || "http://localhost:3000";

const hydraBaseOptions: any = {};

if (process.env.MOCK_TLS_TERMINATION) {
  hydraBaseOptions.headers = { "X-Forwarded-Proto": "https" };
}

console.log("apiBaseKratosInternalUrl", apiBaseKratosInternalUrl);
console.log("apiBaseHydraUrlInternal", apiBaseHydraUrlInternal);
console.log("browserBaseUrl", browserBaseUrl);

// Sets up the SDK
export const sdk = {
  basePath: apiBaseKratosInternalUrl,
  frontend: new FrontendApi(
    new Configuration({
      basePath: apiBaseKratosInternalUrl,
    })
  ),
  oauth2: new OAuth2Api(
    new Configuration({
      basePath: apiBaseHydraUrlInternal,
      baseOptions: hydraBaseOptions,
    })
  ),
};

// Default Config
export const defaultConfig = {
  kratosApiBaseUrl: apiBaseKratosInternalUrl,
  kratosBrowserUrl: browserBaseUrl,
};
