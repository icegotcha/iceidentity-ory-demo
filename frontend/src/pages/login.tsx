import Image from 'next/image'

import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

import Layout from 'components/Layout'
import LoginIllust from 'assets/images/login-illust.svg'
import Title from 'components/Title'
import Input from 'components/Input'
import Button from 'components/Button'

import GoogleIcon from 'assets/icons/google.svg'
import FacebookIcon from 'assets/icons/facebook.svg'
import GithubIcon from 'assets/icons/github.svg'

const Home = () => {
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
        <Button type='link'>Sign up</Button>
      </p>
    </Layout>
  )
}

export default Home
