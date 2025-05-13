import { zValidator } from '@hono/zod-validator'

import db from '@/db'
import { tasksTable } from '@/db/schemas/tasks.schema'
import { factory } from '@/utils/hono.utils'
import { genericPaginationSchema } from '@/validations/common.validations'

// GET /api/tasks - Get all tasks for a user
export const getAllTasksHandler = factory.createHandlers(
  zValidator('query', genericPaginationSchema),
  async (c) => {
    const tasks = await db.select().from(tasksTable)

    return c.json({
      success: true,
      message: 'OK',
      data: tasks,
      pagination: {
        page: 1,
        limit: 20,
        total: tasks.length,
        pages: Math.ceil(tasks.length / 20),
      },
    })
  },
)

// POST /api/tasks - Create a new task
export const createTaskHandler = factory.createHandlers(async (c) => {})
