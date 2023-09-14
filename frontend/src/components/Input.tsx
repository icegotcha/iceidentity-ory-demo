import { InputHTMLAttributes, useState } from 'react'
import InputErrorMessage, { InputErrorProps } from './InputErrorMessage'

interface InputProps extends InputErrorProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string
  icon?: React.ReactNode
}

const Input = ({ name, label, errors, icon, onBlur, onChange, ...rest }: InputProps) => {
  const [focus, setFocus] = useState(false)
  const [value, setValue] = useState('')
  return (
    <>
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
            name={name}
            className='absolute top-0 z-0 w-full bg-transparent outline-none focus-visible:shadow-none'
            onFocus={() => setFocus(true)}
            onBlur={(e) => {
              setFocus(false)
              onBlur?.(e)
            }}
            onChange={(e) => {
              setValue(e.target.value)
              onChange?.(e)
            }}
            {...rest}
          />
        </div>
      </div>
      <InputErrorMessage errors={errors} name={name} />
    </>
  )
}

export default Input
