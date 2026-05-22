import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email')
export const passwordSchema = z.string().min(8, 'Minimum 8 characters')
export const nameSchema = z.string().min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters')

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})
