/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: Remove ts-nocheck when all components are properly insert props
import Image from 'next/image'
import { IdentificationIcon, LockClosedIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import Title from '@/components/Title'

import SignupIllust from 'assets/images/signup-illust.svg'
import GoogleIcon from 'assets/icons/google.svg'
import FacebookIcon from 'assets/icons/facebook.svg'
import GithubIcon from 'assets/icons/github.svg'

const SignUpPage = () => {
  return (
    <Layout title='Login'>
      <div className='w-full mb-8'>
        <Image src={SignupIllust} width={300} alt='Signup Illustration' className='m-auto' />
      </div>
      <Title>Sign up</Title>
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
      <form className='mt-8'>
        <div className='mb-4'>
          <Input name='email' label='Email' icon={<UserIcon />} />
        </div>
        <div className='mb-4'>
          <Input name='password' label='Password' type='password' icon={<LockClosedIcon />} />
        </div>
        <div className='mb-4'>
          <Input name='fullname' label='Full Name' icon={<IdentificationIcon />} />
        </div>
        <div className='mb-4'>
          <Input name='mobile' label='Mobile Number' icon={<PhoneIcon />} />
        </div>
        <div className='mb-8'>
          <Button block type='primary'>
            Continue
          </Button>
        </div>
      </form>

      <p className='text-base text-gray-400'>
        Have an account?
        <Button type='link' href='/login'>
          Login
        </Button>
      </p>
    </Layout>
  )
}

export default SignUpPage
