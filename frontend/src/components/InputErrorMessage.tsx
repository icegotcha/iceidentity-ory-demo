import { FieldErrors } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { SignInFieldName, SignInSchemaType } from '@/types/signin'
import { SignUpFieldName, SignUpSchemaType } from '@/types/signup'

export interface InputErrorProps {
  name: SignInFieldName | SignUpFieldName
  errors: FieldErrors<SignInSchemaType | SignUpSchemaType>
}

const InputErrorMessage = ({ errors, name }: InputErrorProps) => {
  return (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => (
        <div className='w-full'>
          <span className='w-6 h-6 text-sm text-red-600'>{message}</span>
        </div>
      )}
    />
  )
}

export default InputErrorMessage
