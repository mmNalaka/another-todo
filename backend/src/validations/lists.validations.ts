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

export const updateListBodySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  schema: z.any().optional().nullable(),
  isShared: z.boolean().optional(),
  isFrozen: z.boolean().optional(),
})

export const toggleListFrozenSchema = z.object({
  isFrozen: z.boolean(),
})
