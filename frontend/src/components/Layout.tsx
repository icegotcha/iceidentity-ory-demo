import Head from 'next/head'

interface LayoutProps {
  title?: string
  children: React.ReactNode
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className='w-full h-full bg-primary-light flex items-center justify-center py-8'>
      <Head>
        <title>{title ? `IceIdentity | ${title}` : 'IceIdentity'}</title>
      </Head>

      <main className='shadow-xl bg-white border  border-gray-100 rounded-lg p-8'>{children}</main>
    </div>
  )
}

export default Layout
