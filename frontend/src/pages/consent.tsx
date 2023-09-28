import Layout from '@/components/Layout'
import oryHydra from '@/utils/sdk/ory-hydra'
import { GetServerSidePropsContext } from 'next'

interface ConsentPageProps {
  challenge: string
  requestedScope: string[]
  client: {
    name: string
    id: string
  }
  action: string
  logoUrl?: string
  policyUrl?: string
  tosUrl?: string
}

const ConsentPage = (props: ConsentPageProps) => {
  const { challenge, requestedScope, client, action, logoUrl, policyUrl, tosUrl } = props
  return (
    <Layout title='Authorization Grant'>
      <h1>An application requests access to your data!</h1>
      {logoUrl && <img src={logoUrl} alt='Logo' />}
      <form method='POST' action={action}>
        <input type='hidden' name='challenge' value={challenge} />
        <p className='mb-4'>
          <strong>{client.name || client.id}</strong> wants access resources on your behalf and to:
        </p>

        <section className='mb-4'>
          {requestedScope.map((scope) => (
            <div key={scope}>
              <input type='checkbox' name='grant_scope' value={scope} id={scope} />
              <label htmlFor={scope}>{scope}</label>
            </div>
          ))}
        </section>

        <p className='mb-4'>
          Do you want to be asked next time when this application wants to access your data? The application will not be
          able to ask for more permissions without your consent.
        </p>

        <div className='mb-4 flex gap-2'>
          {policyUrl && (
            <a href={policyUrl} target='_blank' rel='noreferrer'>
              Policy
            </a>
          )}

          {tosUrl && (
            <a href={tosUrl} target='_blank' rel='noreferrer'>
              Terms of Service
            </a>
          )}
        </div>

        <div className='mb-4'>
          <input type='checkbox' name='remember' id='remember' value='1' />
          <label htmlFor='remember'>Remember my decision</label>
        </div>

        <div className='mb-4'>
          <input type='submit' id='accept' value='Allow access' />
          <input type='submit' id='reject' value='Deny access' />
        </div>
      </form>
    </Layout>
  )
}

export default ConsentPage

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { query } = context
  const consentChallenge = query.consent_challenge?.toString()
  if (!consentChallenge || typeof consentChallenge !== 'string' || consentChallenge.length === 0) {
    return {
      notFound: true,
    }
  }

  const { data: consentRequest } = await oryHydra.getOAuth2ConsentRequest({
    consentChallenge,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (consentRequest.skip || (consentRequest.client as any)?.skip_consent) {
    const { data: body } = await oryHydra.acceptOAuth2ConsentRequest({
      consentChallenge,
      acceptOAuth2ConsentRequest: {
        // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
        // are requested accidentally.
        grant_scope: consentRequest.requested_scope,

        // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
        grant_access_token_audience: consentRequest.requested_access_token_audience,

        // The session allows us to set session data for id and access tokens
        session: {
          // This data will be available when introspecting the token. Try to avoid sensitive information here,
          // unless you limit who can introspect tokens.
          // accessToken: { foo: 'bar' },
          // This data will be available in the ID token.
          // idToken: { baz: 'bar' },
        },
      },
    })
    // All we need to do now is to redirect the user back to hydra!
    return {
      redirect: {
        statusCode: 302,
        destination: String(body.redirect_to),
      },
    }
  }
  return {
    props: {
      challenge: consentChallenge,
      requestedScope: consentRequest.requested_scope,
      client: {
        name: consentRequest.client?.client_name,
        id: consentRequest.client?.client_id,
      },
      action: '/api/oauth/consent',
    },
  }
}
