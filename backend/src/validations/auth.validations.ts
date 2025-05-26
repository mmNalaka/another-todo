import { z } from 'zod'

// No strict password policies
export const signUpBodySchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(2),
    confirmPassword: z.string().min(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(2),
})

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string(),
})
