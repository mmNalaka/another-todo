import { zValidator } from '@hono/zod-validator'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import {
  createPersonalList,
  deleteList,
  getAllPersonalLists,
  getListById,
  getListCollaborators,
  getListTasks,
  updateList,
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
  updateListBodySchema,
} from '@/validations/lists.validations'
import { generateListId } from '@/utils/id'

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
      id: generateListId(),
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

// PATCH /api/lists/:id - Update a task_list
export const updateListHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  zValidator('json', updateListBodySchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')

    // Check if list exists and user has permission to update it
    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND')
    }

    const { ownerId, isShared } = existingList
    const isOwner = ownerId === userInfo.id
    
    // If user is not the owner, check if they are a collaborator with editor role
    if (!isOwner) {
      // If the list is not shared, return forbidden
      if (!isShared) {
        return createErrorResponse(c, 'FORBIDDEN')
      }
      
      // Get collaborators and check if user is an editor
      const collaborators = await getListCollaborators(id)
      const userCollaborator = collaborators.find(
        (c) => c.collaborator.userId === userInfo.id
      )
      
      // If user is not a collaborator or doesn't have editor role, return forbidden
      if (!userCollaborator || userCollaborator.collaborator.role !== 'editor') {
        return createErrorResponse(c, 'FORBIDDEN')
      }
    }

    // Update the list
    const updatedList = await updateList(id, data)
    if (!updatedList) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createSuccessResponse(c, updatedList)
  },
)

// DELETE /api/lists/:id - Delete a task_list
export const deleteListHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')

    // Check if list exists and user has permission to delete it
    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND')
    }

    // Only the owner can delete the list
    if (existingList.ownerId !== userInfo.id) {
      return createErrorResponse(c, 'FORBIDDEN')
    }

    // Delete the list
    const deletedList = await deleteList(id)
    if (!deletedList) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }

    return createSuccessResponse(c, { success: true, id })
  },
)
