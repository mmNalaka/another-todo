import { zValidator } from '@hono/zod-validator'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import {
  createPersonalList,
  getAllPersonalLists,
  getListById,
  getListCollaborators,
  getListTasks,
} from '@/db/repositories/lists.repo'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import {
  calculatePagination,
  createPaginatedResponse,
  createSuccessResponse,
} from '@/utils/response.utils'
import { genericPaginationSchema } from '@/validations/common.validations'
import {
  createListBodySchema,
  getListParamsSchema,
} from '@/validations/lists.validations'

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

// GET /api/lists/:id - Get a task_list by id
export const getListByIdHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')

    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND')
    }

    const { ownerId, isShared } = existingList
    const isOwner = ownerId === userInfo.id

    // Return forbidden if user is not owner and list is not shared
    if (!isOwner && !isShared) {
      return createErrorResponse(c, 'FORBIDDEN')
    }

    const collaborators = await getListCollaborators(id)

    // Check if user is a collaborator when list is shared
    if (!isOwner && isShared) {
      const isCollaborator = collaborators.some(
        (c) => c.collaborator.userId === userInfo.id,
      )
      if (!isCollaborator) {
        return createErrorResponse(c, 'FORBIDDEN')
      }
    }

    // Get tasks and return full list details
    const tasks = await getListTasks(id)
    return createSuccessResponse(c, {
      ...existingList,
      tasks,
      collaborators,
    })
  },
)
