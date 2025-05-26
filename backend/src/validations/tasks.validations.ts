import { z } from 'zod'

import { genericPaginationSchema } from '@/validations/common.validations'

export const createTaskBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string().optional().nullable().default(null),
  parentTaskId: z.string().optional(),
  value: z.string().optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low', 'None']).optional(),
})

export const updateTaskBodySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  listId: z.string().optional(),
  parentTaskId: z.string().optional(),
  value: z.string().optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low', 'None']).optional(),
})

export const taskIdParamSchema = z.object({
  id: z.string(),
})

export const taskPositionSchema = z.object({
  id: z.string(),
  position: z.number(),
})

export const reorderTasksBodySchema = z.object({
  listId: z.string().optional().nullable().default(null),
  tasks: z.array(taskPositionSchema),
})

// Extended query schema for task filtering
export const taskFilterSchema = genericPaginationSchema.extend({
  completed: z.enum(['true', 'false']).optional(),
  dueDate: z.enum(['today', 'all']).optional(),
})
