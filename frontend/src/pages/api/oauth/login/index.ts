import type { NextApiRequest, NextApiResponse } from 'next'
import { isQuerySet, getRequestUrl } from '@/utils/sdk'
import logger from '@/utils/logger'
import oryHydra from '@/utils/sdk/ory-hydra'
import { ORY_KRATOS_BROWSER_URL, ORY_KRATOS_INTERNAL_API_URL, oryKratosInternalApi } from '@/utils/sdk/ory-kratos'
import { ResponseError } from '@/types/error'

const redirectToLogin = (req: NextApiRequest, res: NextApiResponse) => {
  logger.info(
    'Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found.',
  )

  const baseUrl = getRequestUrl(req)

  logger.debug('Return to: ', {
    url: req.url,
    base: baseUrl,
    'kratos.browser': ORY_KRATOS_BROWSER_URL,
  })

  const returnTo = new URL(req.url as string, baseUrl)
  logger.debug(`returnTo: "${returnTo.toString()}"`, returnTo)

  logger.debug('new URL: ', [ORY_KRATOS_INTERNAL_API_URL + '/self-service/login/browser', baseUrl])

  const redirectTo = new URL(ORY_KRATOS_INTERNAL_API_URL + '/self-service/login/browser', baseUrl)
  redirectTo.searchParams.set('refresh', 'true')
  redirectTo.searchParams.set('return_to', returnTo.toString())

  logger.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo)

  res.redirect(redirectTo.toString())
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const loginChallenge = req.query.login_challenge?.toString()
    if (!isQuerySet(loginChallenge)) {
      const error = new ResponseError('login_challenge is not set', 400)
      throw error
    }
    const { data: loginRequest } = await oryHydra.getOAuth2LoginRequest({
      loginChallenge,
    })
    if (loginRequest.skip) {
      logger.debug('Accepting ORY Hydra Login Request because skip is true')
      return oryHydra
        .acceptOAuth2LoginRequest({
          loginChallenge,
          acceptOAuth2LoginRequest: {
            subject: loginRequest.subject,
          },
        })
        .then(({ data }) => res.redirect(String(data.redirect_to)))
    }

    const kratosSessionCookie = req.cookies.ory_kratos_session
    if (!kratosSessionCookie) {
      // The state was set but we did not receive a session. Let's retry.
      logger.debug('Redirecting to login page because no ORY Kratos session cookie was set.')
      redirectToLogin(req, res)
      return
    }

    //  Get the session
    const { data: session } = await oryKratosInternalApi.toSession({
      cookie: req.headers.cookie,
    })

    const subject = session.identity.id

    // User is authenticated, accept the LoginRequest and tell Hydra
    const { data: response } = await oryHydra.acceptOAuth2LoginRequest({
      loginChallenge,
      acceptOAuth2LoginRequest: {
        subject,
        context: session,
      },
    })
    return res.redirect(String(response.redirect_to))
  } catch (error) {
    if (error instanceof ResponseError) {
      return res.status(error.status || 500).json({ message: error.message })
    }
    return res.status(500).json({ message: error })
  }
}
