type ButtonType = 'primary' | 'default' | 'link'

interface ButtonProps {
  children: React.ReactNode
  type?: ButtonType
  block?: boolean
  onClick?: () => void
}

const Button = ({ type = 'default', children, block, onClick }: ButtonProps) => {
  const fullWidth = block ? 'w-full block' : ''
  if (type === 'primary') {
    return (
      <a
        className={`${fullWidth} py-3 px-5 rounded-md inline-flex items-center justify-center  border bg-primary  border-primary text-base text-center text-white cursor-pointer hover:bg-primary-dark duration-300 transition`}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  if (type === 'link') {
    return (
      <a
        className={`${fullWidth} px-2 rounded-md inline-flex items-center justify-center text-base text-center text-primary cursor-pointer hover:text-primary-dark duration-300 transition`}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  return (
    <a
      className={`${fullWidth} py-3 px-5 rounded-md inline-flex items-center justify-center border border-gray-300 shadow-sm  bg-white text-base text-center text-gray-900 cursor-pointer hover:text-primary hover:border-primary duration-300 transition`}
      onClick={onClick}
    >
      {children}
    </a>
  )
}

export default Button
