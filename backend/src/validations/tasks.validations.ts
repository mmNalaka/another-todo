import { z } from 'zod'

export const createTaskBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string().optional().nullable().default(null),
  parentTaskId: z.string().optional(),
  value: z.string().optional(),
})

export const updateTaskBodySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  listId: z.string().optional(),
  parentTaskId: z.string().optional(),
  value: z.string().optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().optional(),
})

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
})
