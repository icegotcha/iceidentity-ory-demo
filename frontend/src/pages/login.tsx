import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { LoginFlow } from '@ory/client'

import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

import Layout from 'components/Layout'
import Title from 'components/Title'
import Input from 'components/Input'
import Button from 'components/Button'

import LoginIllust from 'assets/images/login-illust.svg'
import GoogleIcon from 'assets/icons/google.svg'
import FacebookIcon from 'assets/icons/facebook.svg'
import GithubIcon from 'assets/icons/github.svg'
import ory from 'pkg/sdk'

const LoginPage = () => {
  const [flow, setFlow] = useState<LoginFlow>()

  // Get ?flow=... from the URL
  const router = useRouter()
  const {
    return_to: returnTo,
    flow: flowId,
    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
    // of a user.
    refresh,
    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
    // to perform two-factor authentication/verification.
    aal,
  } = router.query

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return
    }
    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory.getLoginFlow({ id: String(flowId) }).then(({ data }) => {
        setFlow(data)
      })
      // .catch(handleGetFlowError(router, 'login', setFlow))
      return
    }

    // Otherwise we initialize it
    ory
      .createBrowserLoginFlow({
        refresh: Boolean(refresh),
        aal: aal ? String(aal) : undefined,
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data)
      })
    // .catch(handleFlowError(router, 'login', setFlow))
  }, [flowId, router, router.isReady, aal, refresh, returnTo, flow])

  return (
    <Layout title='Login'>
      <div className='w-full mb-8'>
        <Image src={LoginIllust} width={300} alt='Login Illustration' className='m-auto' />
      </div>
      <Title>Login</Title>
      <form className='mt-8'>
        <div className='mb-4'>
          <Input name='email' label='Email' icon={<UserIcon />} />
        </div>
        <div className='mb-4'>
          <Input name='password' label='Password' type='password' icon={<LockClosedIcon />} />
        </div>
        <div className='mb-8'>
          <Button block type='primary'>
            Sign in
          </Button>
        </div>
      </form>
      <p className='text-base mb-6 text-gray-400 text-center'>Or connect with</p>
      <ul className='flex justify-between -mx-2 mb-6'>
        <li className='px-2 w-full'>
          <Button block>
            <Image alt='google' src={GoogleIcon} width={24} className='m-auto' />
          </Button>
        </li>
        <li className='px-2 w-full'>
          <Button block>
            <Image alt='facebook' src={FacebookIcon} width={24} className='m-auto' />
          </Button>
        </li>
        <li className='px-2 w-full'>
          <Button block>
            <Image alt='github' src={GithubIcon} width={24} className='m-auto' />
          </Button>
        </li>
      </ul>
      <p className='text-base text-gray-400'>
        Not a member yet?
        <Button type='link' href='/signup'>
          Sign up
        </Button>
      </p>
    </Layout>
  )
}

export default LoginPage
