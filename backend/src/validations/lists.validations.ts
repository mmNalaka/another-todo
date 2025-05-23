import { z } from 'zod'

export const createListBodySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  schema: z.any().optional().nullable(),
})

export const getListParamsSchema = z.object({
  id: z.string().min(1, { message: 'List ID is required' }),
})
