import Head from 'next/head';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Head>
        <title>IceIdentity | {title}</title>
      </Head>

      <main className="shadow-xl border border-gray-200 rounded-md px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
