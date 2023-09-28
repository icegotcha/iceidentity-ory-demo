import { ResponseError } from '@/types/error'
import oryHydra from '@/utils/sdk/ory-hydra'
import { oryKratosInternalApi } from '@/utils/sdk/ory-kratos'
import { AcceptOAuth2ConsentRequestSession } from '@ory/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const postConsent = async (req: NextApiRequest, res: NextApiResponse) => {
  const challenge = req.body.challenge

  if (req.body.submit === 'Deny access') {
    // Looks like the consent request was denied by the user
    await oryHydra
      .rejectOAuth2ConsentRequest({
        consentChallenge: challenge,
        rejectOAuth2Request: {
          error: 'access_denied',
          error_description: 'The resource owner denied the request',
        },
      })
      .then(({ data: body }) => {
        // All we need to do now is to redirect the browser back to hydra!
        res.redirect(String(body.redirect_to))
      })
  }

  // Seems like the user accept the consent!

  let grantScope = req.body.grant_scope
  if (!Array.isArray(grantScope)) {
    grantScope = [grantScope]
  }

  //  Get the session
  const { data: kratosSession } = await oryKratosInternalApi.toSession({
    cookie: req.headers.cookie as string,
  })

  // The session allows us to set session data for id and access tokens
  const session: AcceptOAuth2ConsentRequestSession = {
    // This data will be available when introspecting the token. Try to avoid sensitive information here,
    // unless you limit who can introspect tokens.
    access_token: {
      // foo: 'bar'
    },

    // This data will be available in the ID token.
    id_token: {
      ...(grantScope.indexOf('email') !== -1
        ? {
            email: kratosSession.identity.traits.email,
            email_verified: true,
          }
        : {}),
      ...(grantScope.indexOf('phone') !== -1
        ? {
            phone_number: kratosSession.identity.traits.mobile,
            phone_number_verified: true,
          }
        : {}),
      ...(grantScope.indexOf('profile') !== -1
        ? {
            name: kratosSession.identity.traits.name,
            given_name: kratosSession.identity.traits.name.split(' ')[0],
            family_name: kratosSession.identity.traits.name.split(' ')[1],
          }
        : {}),
    },
  }

  // Here is also the place to add data to the ID or access token. For example,
  // if the scope 'profile' is added, add the family and given name to the ID Token claims:
  // if (grantScope.indexOf('profile')) {
  //   session.id_token.family_name = 'Doe'
  //   session.id_token.given_name = 'John'
  // }

  // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
  const { data: consentRequest } = await oryHydra.getOAuth2ConsentRequest({ consentChallenge: challenge })
  await oryHydra
    .acceptOAuth2ConsentRequest({
      consentChallenge: challenge,
      acceptOAuth2ConsentRequest: {
        // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
        // are requested accidentally.
        grant_scope: grantScope,
        session,
        // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
        grant_access_token_audience: consentRequest.requested_access_token_audience,

        // This tells hydra to remember this consent request and allow the same client to request the same
        // scopes from the same user, without showing the UI, in the future.
        remember: Boolean(req.body.remember),

        // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
        remember_for: 3600,
      },
    })
    .then(({ data: body }) => {
      // All we need to do now is to redirect the user back to hydra!
      res.redirect(String(body.redirect_to))
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      return postConsent(req, res)
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      return res.status(error.status || 500).json({ message: error.message })
    }
    return res.status(500).json({ message: error })
  }
}
