import { Configuration, FrontendApi } from '@ory/client'
import { edgeConfig } from '@ory/integrations/next'

export const ORY_KRATOS_INTERNAL_API_URL = process.env.ORY_KRATOS_URL || 'http://127.0.0.1:4433'

export const ORY_KRATOS_BROWSER_URL = process.env.ORY_KRATOS_BROWSER_URL || 'http://127.0.0.1:4433'

// For internal API calls
export const oryKratosInternalApi = new FrontendApi(
  new Configuration({
    basePath: ORY_KRATOS_INTERNAL_API_URL,
    baseOptions: {
      withCredentials: true,
    },
  }),
)
// For browser calls
const frontendApi = new FrontendApi(new Configuration(edgeConfig))

export default frontendApi
