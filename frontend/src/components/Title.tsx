interface TitleProps {
  children: React.ReactNode
}

const Title = ({ children }: TitleProps) => {
  return <h1 className='text-3xl font-bold text-primary-dark'>{children}</h1>
}

export default Title
