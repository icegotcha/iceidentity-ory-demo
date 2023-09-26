import { z } from 'zod'
import { parsePhoneNumber } from 'libphonenumber-js'

export type SignUpFieldName = 'email' | 'password' | 'fullname' | 'mobile'

export const SignUpSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, {
      message: 'Password must be at least 6 characters',
    })
    .regex(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{6,}$/, {
      message:
        'Password must contain at least 1 uppercase letters, 1 lowercase letter, 1 digits and 1 special character',
    }),
  fullname: z.string({ required_error: 'Fullname is required' }).min(1, {
    message: 'Fullname is required',
  }),
  mobile: z
    .string({ required_error: 'Mobile is required' })
    .min(1, {
      message: 'Mobile is required',
    })
    .refine(
      (mobile) => {
        try {
          const phone = parsePhoneNumber(mobile)
          return phone.isValid()
        } catch (error) {
          return false
        }
      },
      {
        message: 'Invalid mobile number',
      },
    ),
})

export type SignUpSchemaType = z.infer<typeof SignUpSchema>
