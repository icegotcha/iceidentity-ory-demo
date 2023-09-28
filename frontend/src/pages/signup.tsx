import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ContinueWithVerificationUi, RegistrationFlow, UiNodeInputAttributes } from '@ory/client'
import { IdentificationIcon, LockClosedIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import Title from '@/components/Title'

import SignupIllust from '@/assets/images/signup-illust.svg'
import GoogleIcon from '@/assets/icons/google.svg'
import FacebookIcon from '@/assets/icons/facebook.svg'
import GithubIcon from '@/assets/icons/github.svg'

import oryKratos from '@/utils/sdk/ory-kratos'
import handleFlowError from '@/utils/sdk/errors'
import { SignUpSchema, SignUpSchemaType } from '@/types/signup'
import Alert from '@/components/Alert'
import { AxiosError } from 'axios'

const SignUpPage = () => {
  const router = useRouter()
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchemaType>({ resolver: zodResolver(SignUpSchema), mode: 'onChange' })

  // The "flow" represents a registration process and contains
  // information about the form we need to render (e.g. username + password)
  const [flow, setFlow] = useState<RegistrationFlow>()

  // Get ?flow=... from the URL
  const { flow: flowId, return_to: returnTo } = router.query

  // In this effect we either initiate a new registration flow, or we fetch an existing registration flow.
  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      oryKratos
        .getRegistrationFlow({ id: String(flowId) })
        .then(({ data }) => {
          // We received the flow - let's use its data and render the form!
          setFlow(data)
        })
        .catch(handleFlowError(router, 'registration', setFlow))
      return
    }

    // Otherwise we initialize it
    oryKratos
      .createBrowserRegistrationFlow({
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data)
      })
      .catch(handleFlowError(router, 'registration', setFlow))
  }, [flowId, router, router.isReady, returnTo, flow])

  const onSubmit = async (values: SignUpSchemaType) => {
    await router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/signup?flow=${flow?.id}`, undefined, { shallow: true })

    const csrf_token = (
      flow?.ui.nodes.find((n) => (n.attributes as UiNodeInputAttributes).name === 'csrf_token')
        ?.attributes as UiNodeInputAttributes
    )?.value as string
    const indexLastSpace = values.fullname.lastIndexOf(' ')
    const firstName = values.fullname.substring(0, indexLastSpace)
    const lastName = values.fullname.substring(indexLastSpace + 1)
    oryKratos
      .updateRegistrationFlow({
        flow: String(flow?.id),
        updateRegistrationFlowBody: {
          method: 'password',
          password: values.password,
          traits: {
            email: values.email,
            name: {
              first: firstName,
              last: lastName,
            },
            mobile: values.mobile,
          },
          csrf_token,
        },
      })
      .then(async ({ data }) => {
        // If we ended up here, it means we are successfully signed up!
        //
        // You can do cool stuff here, like having access to the identity which just signed up:
        console.log('This is the user session: ', data, data.identity)

        // continue_with is a list of actions that the user might need to take before the registration is complete.
        // It could, for example, contain a link to the verification form.
        if (data.continue_with) {
          for (const item of data.continue_with) {
            switch (item.action) {
              case 'show_verification_ui':
                await router.push('/verification?flow=' + (item as ContinueWithVerificationUi).flow.id)
                return
            }
          }
        }

        // If continue_with did not contain anything, we can just return to the home page.
        await router.push(flow?.return_to || '/')
      })
      .catch(handleFlowError(router, 'registration', setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          setFlow(err.response?.data as RegistrationFlow)
          return
        }

        return Promise.reject(err)
      })
  }

  return (
    <Layout title='Login'>
      <div className='w-full mb-8'>
        <Image src={SignupIllust} width={300} alt='Signup Illustration' className='m-auto' />
      </div>
      <Title>Sign up</Title>
      {flow?.ui.messages && flow.ui.messages?.length > 0 && (
        <Alert type='error'>
          <ul className='list-none'>
            {flow.ui.messages.map((message) => (
              <li key={message.id}>{message.text}</li>
            ))}
          </ul>
        </Alert>
      )}
      <ul className='flex justify-between my-8'>
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
      <p className='text-base mb-6 text-gray-400 text-center'>Or, register with email</p>
      <form className='mt-8' action={flow?.ui.action} method={flow?.ui.method} onSubmit={handleSubmit(onSubmit)}>
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
        <div className='mb-4'>
          <Controller
            control={control}
            name='fullname'
            render={({ field }) => <Input label='Full Name' errors={errors} icon={<IdentificationIcon />} {...field} />}
          />
        </div>
        <div className='mb-4'>
          <Controller
            control={control}
            name='mobile'
            render={({ field }) => <Input label='Mobile Number' errors={errors} icon={<PhoneIcon />} {...field} />}
          />
        </div>
        <div className='mb-8'>
          <input
            type='submit'
            disabled={isSubmitting}
            className='w-full py-3 px-5 rounded-md inline-flex items-center justify-center border bg-primary border-primary text-base text-center text-white cursor-pointer hover:bg-primary-dark duration-300 transition'
            value='Continue'
          />
        </div>
      </form>

      <p className='text-base text-gray-400'>
        Have an account?
        <Button type='link' href='/signin'>
          Sign in
        </Button>
      </p>
    </Layout>
  )
}

export default SignUpPage
