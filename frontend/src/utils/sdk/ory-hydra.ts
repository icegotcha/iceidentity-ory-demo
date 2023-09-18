import { Configuration, OAuth2Api } from '@ory/client'

export const apiBaseHydraUrlInternal = process.env.ORY_HYDRA_URL || 'http://localhost:4445'

const config = new Configuration({
  basePath: apiBaseHydraUrlInternal,
})

export const oauth2Api = new OAuth2Api(config)

export default oauth2Api
