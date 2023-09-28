import Head from 'next/head'

interface LayoutProps {
  title?: string
  children: React.ReactNode
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <main className='w-full min-h-screen py-0 sm:py-8 bg-primary-light flex items-center justify-center'>
      <Head>
        <title>{title ? `IceIdentity | ${title}` : 'IceIdentity'}</title>
      </Head>

      <div className='shadow-xl w-full md:w-96 rounded-none sm:rounded-lg p-8 bg-white border  border-gray-100'>
        {children}
      </div>
    </main>
  )
}

export default Layout
