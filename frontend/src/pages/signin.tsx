import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginFlow } from '@ory/client'

import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

import Layout from '@/components/Layout'
import Title from '@/components/Title'
import Input from '@/components/Input'
import Button from '@/components/Button'

import LoginIllust from '@/assets/images/login-illust.svg'
import GoogleIcon from '@/assets/icons/google.svg'
import FacebookIcon from '@/assets/icons/facebook.svg'
import GithubIcon from '@/assets/icons/github.svg'

import oryKratos from '@/utils/sdk/ory-kratos'
import handleGetFlowError from '@/utils/sdk/errors'
import { SignInSchema, SignInSchemaType } from '@/types/signin'

const SignInPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchemaType>({ resolver: zodResolver(SignInSchema), mode: 'onChange' })

  const [flow, setFlow] = useState<LoginFlow>()

  const router = useRouter()
  const { return_to: returnTo, flow: flowId, refresh, aal } = router.query

  useEffect(() => {
    if (!router.isReady || flow) {
      return
    }

    if (flowId) {
      oryKratos
        .getLoginFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data)
        })
        .catch(handleGetFlowError(router, 'login', setFlow))
      return
    }

    oryKratos
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

  const onSubmit = async (values: SignInSchemaType) => {
    try {
      await oryKratos.updateLoginFlow({
        flow: String(flow?.id),
        updateLoginFlowBody: {
          method: 'password',
          identifier: values.email,
          password: values.password,
        },
      })

      if (flow?.return_to) {
        window.location.href = flow?.return_to
        return
      }
      router.push('/')
    } catch (err) {
      handleGetFlowError(router, 'login', setFlow)
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
          <Controller
            control={control}
            name='email'
            render={({ field }) => <Input label='Email' errors={errors} icon={<UserIcon />} {...field} />}
          />
        </div>
        <div className='mb-4'>
          <Controller
            control={control}
            name='password'
            render={({ field }) => (
              <Input label='Password' type='password' errors={errors} icon={<LockClosedIcon />} {...field} />
            )}
          />
        </div>
        <div className='mb-8'>
          <input
            type='submit'
            disabled={isSubmitting}
            className='w-full py-3 px-5 rounded-md inline-flex items-center justify-center border bg-primary border-primary text-base text-center text-white cursor-pointer hover:bg-primary-dark duration-300 transition'
            value='Sign in'
          />
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

export default SignInPage
