import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { LoginFlow, UpdateLoginFlowBody } from '@ory/client'

import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

import Layout from 'components/Layout'
import Title from 'components/Title'
import Input from 'components/Input'
import Button from 'components/Button'

import LoginIllust from 'assets/images/login-illust.svg'
import GoogleIcon from 'assets/icons/google.svg'
import FacebookIcon from 'assets/icons/facebook.svg'
import GithubIcon from 'assets/icons/github.svg'

import ory from 'utils/sdk'
import handleGetFlowError from 'utils/sdk/errors'
import { useForm } from 'react-hook-form'

const LoginPage = () => {
  const { register, handleSubmit } = useForm<UpdateLoginFlowBody>()

  const [flow, setFlow] = useState<LoginFlow>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const router = useRouter()
  const { return_to: returnTo, flow: flowId, refresh, aal } = router.query

  useEffect(() => {
    if (!router.isReady || flow) {
      return
    }

    if (flowId) {
      ory
        .getLoginFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data)
        })
        .catch(handleGetFlowError(router, 'login', setFlow))
      return
    }

    ory
      .createBrowserLoginFlow({
        refresh: Boolean(refresh),
        aal: aal ? String(aal) : undefined,
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data)
      })
      .catch(handleGetFlowError(router, 'login', setFlow))
    return () => {}
  }, [router, aal, refresh, returnTo, flowId, flow])

  const onSubmit = async (values: UpdateLoginFlowBody) => {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    router.push(`/login?flow=${flow?.id}`, undefined, { shallow: true })
    try {
      await ory.updateLoginFlow({
        flow: String(flow?.id),
        updateLoginFlowBody: values,
      })

      if (flow?.return_to) {
        window.location.href = flow?.return_to
        return
      }
      router.push('/')
    } catch (err) {
      handleGetFlowError(router, 'login', setFlow)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title='Login'>
      <div className='w-full mb-8'>
        <Image src={LoginIllust} width={300} alt='Login Illustration' className='m-auto' />
      </div>
      <Title>Login</Title>
      <form className='mt-8' onSubmit={handleSubmit(onSubmit)}>
        <div className='mb-4'>
          <Input label='Email' icon={<UserIcon />} {...register('identifier', { required: true })} />
        </div>
        <div className='mb-4'>
          <Input
            label='Password'
            type='password'
            icon={<LockClosedIcon />}
            {...register('password', { required: true })}
          />
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
