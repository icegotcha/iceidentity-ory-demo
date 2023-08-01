import { useState } from 'react'

interface InputProps {
  name: string
  label: string
  type?: string
  icon?: React.ReactNode
}

const Input = ({ name, label, type = 'text', icon }: InputProps) => {
  const [focus, setFocus] = useState(false)
  const [value, setValue] = useState('')
  return (
    <div className={`w-full h-full flex border-b py-3 pl-0 ${focus ? 'border-gray-900' : 'border-[#E9EDF4]'}`}>
      {icon ? (
        <span className={`mr-3 w-6 h-6 ${focus ? 'text-gray-900' : 'text-gray-400'}`}>{icon}</span>
      ) : (
        <span className='h-6'></span>
      )}
      <div className='relative w-full h-full'>
        <label
          htmlFor={name}
          className={`duration-300 absolute -z-1 origin-0 ${focus || value ? 'text-xs -top-4' : 'text-base top-0'}
          ${focus ? 'text-gray-900' : 'text-gray-400'}`}
        >
          {label}
        </label>
        <input
          type={type}
          name={name}
          className='absolute top-0 z-0 w-full bg-transparent outline-none focus-visible:shadow-none'
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Input
