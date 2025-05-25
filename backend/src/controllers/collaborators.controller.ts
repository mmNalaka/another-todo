import { zValidator } from '@hono/zod-validator'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import { factory } from '@/utils/hono.utils'
import { createErrorResponse } from '@/utils/error.utils'
import { createSuccessResponse } from '@/utils/response.utils'
import { getListById } from '@/db/repositories/lists.repo'
import {
  addCollaborator,
  findUserByEmail,
  getCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from '@/db/repositories/collaborators.repo'
import { getListParamsSchema } from '@/validations/lists.validations'
import {
  addCollaboratorSchema,
  removeCollaboratorSchema,
  updateCollaboratorRoleSchema,
} from '@/validations/collaborators.validations'

// POST /api/lists/:id/collaborators - Add a collaborator to a list
export const addCollaboratorHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  zValidator('json', addCollaboratorSchema),
  async (c: any) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const { email, role } = c.req.valid('json')

    // Check if list exists and user has permission to update it
    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND', 'List not found')
    }

    // Only the owner can add collaborators
    if (existingList.ownerId !== userInfo.id) {
      return createErrorResponse(c, 'FORBIDDEN', 'Only the owner can add collaborators')
    }

    // Find the user by email
    const userToAdd = await findUserByEmail(email)
    if (!userToAdd) {
      return createErrorResponse(c, 'NOT_FOUND', 'User not found with this email')
    }

    // Don't allow adding the owner as a collaborator
    if (userToAdd.id === existingList.ownerId) {
      return createErrorResponse(c, 'BAD_REQUEST', 'Cannot add the owner as a collaborator')
    }

    // Check if the user is already a collaborator
    const existingCollaborator = await getCollaborator(id, userToAdd.id)
    if (existingCollaborator) {
      return createErrorResponse(c, 'BAD_REQUEST', 'User is already a collaborator')
    }

    // Add the collaborator
    const collaborator = await addCollaborator({
      listId: id,
      userId: userToAdd.id,
      role,
    })

    // Update the list to be shared
    if (!existingList.isShared) {
      await updateList(id, { isShared: true })
    }

    return createSuccessResponse(c, {
      ...collaborator,
      user: {
        id: userToAdd.id,
        name: userToAdd.name,
        email: userToAdd.email,
        avatar: userToAdd.avatar,
      },
    })
  },
)

// PATCH /api/lists/:id/collaborators/:userId - Update a collaborator's role
export const updateCollaboratorRoleHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  zValidator('json', updateCollaboratorRoleSchema),
  async (c: any) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const { userId } = c.req.param() as { userId: string }
    const { role } = c.req.valid('json')

    // Check if list exists
    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND', 'List not found')
    }

    // Only the owner can update collaborator roles
    if (existingList.ownerId !== userInfo.id) {
      return createErrorResponse(c, 'FORBIDDEN', 'Only the owner can update collaborator roles')
    }

    // Check if the collaborator exists
    const existingCollaborator = await getCollaborator(id, userId)
    if (!existingCollaborator) {
      return createErrorResponse(c, 'NOT_FOUND', 'Collaborator not found')
    }

    // Update the collaborator's role
    const updatedCollaborator = await updateCollaboratorRole(id, userId, role)

    return createSuccessResponse(c, updatedCollaborator)
  },
)

// DELETE /api/lists/:id/collaborators/:userId - Remove a collaborator
export const removeCollaboratorHandler = factory.createHandlers(
  zValidator('param', getListParamsSchema),
  async (c: any) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const { userId } = c.req.param() as { userId: string }

    // Check if list exists
    const existingList = await getListById(id)
    if (!existingList) {
      return createErrorResponse(c, 'NOT_FOUND', 'List not found')
    }

    // Only the owner can remove collaborators
    if (existingList.ownerId !== userInfo.id) {
      return createErrorResponse(c, 'FORBIDDEN', 'Only the owner can remove collaborators')
    }

    // Check if the collaborator exists
    const existingCollaborator = await getCollaborator(id, userId)
    if (!existingCollaborator) {
      return createErrorResponse(c, 'NOT_FOUND', 'Collaborator not found')
    }

    // Remove the collaborator
    const removedCollaborator = await removeCollaborator(id, userId)

    return createSuccessResponse(c, removedCollaborator)
  },
)

// Import the updateList function from lists.repo.ts
import { updateList } from '@/db/repositories/lists.repo'
