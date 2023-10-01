import type { NextApiRequest, NextApiResponse } from 'next'
import { isQuerySet, getRequestUrl } from '@/utils/sdk'
import logger from '@/utils/logger'
import oryHydra from '@/utils/sdk/ory-hydra'
import { ORY_KRATOS_BROWSER_URL, oryKratosInternalApi } from '@/utils/sdk/ory-kratos'
import { ResponseError } from '@/types/error'

const redirectToLogin = (req: NextApiRequest, res: NextApiResponse) => {
  logger.info(
    'Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found.',
  )

  const baseUrl = getRequestUrl(req)

  logger.debug('to: ', {
    url: req.url,
    base: baseUrl,
    'kratos.browser': ORY_KRATOS_BROWSER_URL,
  })

  const returnTo = new URL(req.url as string, baseUrl)
  logger.debug(`returnTo: "${returnTo.toString()}"`, returnTo)

  logger.debug('new URL: ', [ORY_KRATOS_BROWSER_URL + '/self-service/login/browser', baseUrl])

  const redirectTo = new URL(ORY_KRATOS_BROWSER_URL + '/self-service/login/browser', baseUrl)
  redirectTo.searchParams.set('refresh', 'true')
  redirectTo.searchParams.set('return_to', returnTo.toString())

  logger.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo)

  res.redirect(redirectTo.toString())
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const loginChallenge = req.query.login_challenge?.toString()
    console.log('🚀 ~ file: index.ts:38 ~ handler ~ loginChallenge:', loginChallenge)
    if (!isQuerySet(loginChallenge)) {
      const error = new ResponseError('login_challenge is not set', 400)
      throw error
    }
    const { data: loginRequest } = await oryHydra.getOAuth2LoginRequest({
      loginChallenge,
    })
    console.log('🚀 ~ file: index.ts:46 ~ handler ~ loginRequest:', loginRequest)
    if (loginRequest.skip) {
      logger.debug('Accepting ORY Hydra Login Request because skip is true')
      const { data } = await oryHydra.acceptOAuth2LoginRequest({
        loginChallenge,
        acceptOAuth2LoginRequest: {
          subject: loginRequest.subject,
        },
      })
      res.redirect(String(data.redirect_to))
    }

    const kratosSessionCookie = req.cookies.ory_kratos_session
    console.log('🚀 ~ file: index.ts:60 ~ handler ~ kratosSessionCookie:', kratosSessionCookie)
    if (!kratosSessionCookie) {
      // The state was set but we did not receive a session. Let's retry.
      logger.debug('Redirecting to login page because no ORY Kratos session cookie was set.')
      redirectToLogin(req, res)
      return
    }

    console.log('🚀 ~ file: index.ts:70 ~ handler ~ req.headers.cookie:', req.headers.cookie)
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
    console.log('🚀 ~ file: index.ts:84 ~ handler ~ response:', response)
    res.redirect(String(response.redirect_to))
    console.log('🚀 ~ file: index.ts:85 ~ handler ~ esponse.redirect_to:', response.redirect_to)
  } catch (error) {
    console.log('🚀 ~ file: index.ts:82 ~ handler ~ error:', error.message)
    if (error instanceof ResponseError) {
      res.status(error.status || 500).json({ message: error.message })
    }
    res.status(500).json({ message: error })
  }
}
