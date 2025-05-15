import { z } from 'zod'

export const createListBodySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  isFrozen: z.boolean().optional().default(false),
  isShared: z.boolean().optional().default(false),
})
