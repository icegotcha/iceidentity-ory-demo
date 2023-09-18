import { Configuration, FrontendApi } from '@ory/client'
import { edgeConfig } from '@ory/integrations/next'

export const ORY_KRATOS_INTERNAL_API_URL = process.env.ORY_KRATOS_URL || 'http://127.0.0.1:4434'

export const ORY_KRATOS_BROWSER_URL = process.env.ORY_KRATOS_BROWSER_URL || 'http://127.0.0.1:3000'

const frontendApi = new FrontendApi(new Configuration(edgeConfig))

export default frontendApi
