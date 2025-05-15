import { zValidator } from '@hono/zod-validator'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import {
  createPersonalList,
  getAllPersonalLists,
} from '@/db/repositories/lists.repo'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import {
  calculatePagination,
  createPaginatedResponse,
  createSuccessResponse,
} from '@/utils/response.utils'
import { genericPaginationSchema } from '@/validations/common.validations'
import { createListBodySchema } from '@/validations/lists.validations'

// GET /api/lists - Get all tasks_lists for a user
export const getAllListHandler = factory.createHandlers(
  zValidator('query', genericPaginationSchema),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const tasks = await getAllPersonalLists(userInfo.id)

    if (!tasks) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createPaginatedResponse(c, tasks, calculatePagination(tasks.length))
  },
)

// POST /api/lists - Create a new task_list
export const createListHandler = factory.createHandlers(
  zValidator('json', createListBodySchema),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const data = c.req.valid('json')

    const list = await createPersonalList({
      ...data,
      ownerId: userInfo.id,
    })

    if (!list) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }
    return createSuccessResponse(c, list)
  },
)
