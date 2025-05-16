import { zValidator } from '@hono/zod-validator'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import {
  createTask,
  deleteTask,
  getAllUserTasks,
  getTaskById,
  updateTask,
} from '@/db/repositories/tasks.repo'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import {
  calculatePagination,
  createPaginatedResponse,
  createSuccessResponse,
} from '@/utils/response.utils'
import { genericPaginationSchema } from '@/validations/common.validations'
import {
  createTaskBodySchema,
  taskIdParamSchema,
  updateTaskBodySchema,
} from '@/validations/tasks.validations'

// GET /api/tasks - Get all tasks for a user
export const getAllTasksHandler = factory.createHandlers(
  zValidator('query', genericPaginationSchema),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { limit, offset } = c.req.valid('query')

    const tasks = await getAllUserTasks(userInfo.id, limit, offset)

    if (!tasks) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createPaginatedResponse(
      c,
      tasks,
      calculatePagination(tasks.length, limit, offset),
    )
  },
)

// GET /api/tasks/:id - Get a task by id
export const getTaskByIdHandler = factory.createHandlers(
  zValidator('param', taskIdParamSchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')

    const task = await getTaskById(id, userInfo.id)

    if (!task) {
      return createErrorResponse(c, 'NOT_FOUND', 'Task not found')
    }

    return createSuccessResponse(c, task)
  },
)

// POST /api/tasks - Create a new task
export const createTaskHandler = factory.createHandlers(
  zValidator('json', createTaskBodySchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const data = c.req.valid('json')

    const task = await createTask({
      ...data,
      userId: userInfo.id,
    })

    if (!task) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createSuccessResponse(c, task, 'Task created successfully', 201)
  },
)

// PUT /api/tasks/:id - Update a task by id
export const updateTaskHandler = factory.createHandlers(
  zValidator('param', taskIdParamSchema),
  zValidator('json', updateTaskBodySchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')

    // Check if task exists
    const existingTask = await getTaskById(id, userInfo.id)

    if (!existingTask) {
      return createErrorResponse(c, 'NOT_FOUND', 'Task not found')
    }

    const updatedTask = await updateTask(id, userInfo.id, data)

    if (!updatedTask) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createSuccessResponse(c, updatedTask, 'Task updated successfully')
  },
)

// DELETE /api/tasks/:id - Delete a task by id
export const deleteTaskHandler = factory.createHandlers(
  zValidator('param', taskIdParamSchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')

    // Check if task exists
    const existingTask = await getTaskById(id, userInfo.id)

    if (!existingTask) {
      return createErrorResponse(c, 'NOT_FOUND', 'Task not found')
    }

    const deletedTask = await deleteTask(id, userInfo.id)

    if (!deletedTask) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createSuccessResponse(c, deletedTask, 'Task deleted successfully')
  },
)
