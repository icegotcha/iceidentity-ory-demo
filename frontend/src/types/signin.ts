import { z } from 'zod'

export type SignInFieldName = 'email' | 'password'

export const SignInSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }).min(1, {
    message: 'Password is required',
  }),
})

export type SignInSchemaType = z.infer<typeof SignInSchema>
