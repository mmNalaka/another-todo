import { zValidator } from '@hono/zod-validator'

import type { Task, TasksList } from '@/db/schemas/tasks.schema'
import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'
import type { ErrorCode } from '@/utils/error.utils'
import { broadcastToList } from '@/services/websocket.service'

import { getListById, getListCollaborators } from '@/db/repositories/lists.repo'
import {
  createTask,
  deleteTask,
  getAllUserTasks,
  getJustTask,
  getTaskById,
  updateTask,
  updateTaskPositions,
} from '@/db/repositories/tasks.repo'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import {
  calculatePagination,
  createPaginatedResponse,
  createSuccessResponse,
} from '@/utils/response.utils'
import {
  createTaskBodySchema,
  reorderTasksBodySchema,
  taskFilterSchema,
  taskIdParamSchema,
  updateTaskBodySchema,
} from '@/validations/tasks.validations'

async function checkListTaskPermission(
  task: Task,
  userId: string,
  permission: 'editor' | 'viewer',
): Promise<{
    allowed: boolean
    error: ErrorCode | null
    list: TasksList | null
  }> {
  // Check if this is a task that belongs to a list
  const isListTask = task.listId !== null

  // Check if the current user is the owner of the task
  const isTaskOwner = task.userId === userId

  // Only list tasks can be modified through this permission check
  if (!isListTask) {
    return { allowed: false, error: 'FORBIDDEN', list: null }
  }

  // Task owners always have permission
  if (isTaskOwner) {
    return { allowed: true, error: null, list: null }
  }

  // For non-owners, check if they are a collaborator with editor role
  const listCollaborators = await getListCollaborators(task.listId!)
  const userAsCollaborator = listCollaborators.find(
    (collaborator) => collaborator.userId === userId,
  )

  // If required permission is 'viewer', user must be a collaborator with 'viewer' role or 'editor' role
  const hasRequiredPermission
    = userAsCollaborator?.role === permission
      || userAsCollaborator?.role === 'editor'

  // User must be a collaborator with 'editor' role to modify tasks
  if (!userAsCollaborator || !hasRequiredPermission) {
    return { allowed: false, error: 'FORBIDDEN', list: null }
  }

  const list = permission === 'viewer' ? null : await getListById(task.listId!)

  // User has permission as a collaborator with editor role
  return { allowed: true, error: null, list }
}

// GET /api/tasks - Get all tasks for a user
export const getAllTasksHandler = factory.createHandlers(
  zValidator('query', taskFilterSchema),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { limit, offset, completed, dueDate } = c.req.valid('query')

    // Build filter object based on query parameters
    const filter = {
      ...(completed !== undefined && { completed: completed === 'true' }),
      ...(dueDate && { dueDate }),
    }

    const tasks = await getAllUserTasks(userInfo.id, limit, offset, filter)

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

    const task = await getTaskById(id)
    const isOwner = userInfo.id === task?.userId

    if (!task) {
      return createErrorResponse(c, 'NOT_FOUND', 'Task not found')
    }

    const { allowed, error } = await checkListTaskPermission(
      task,
      userInfo.id,
      'viewer',
    )
    if (!isOwner && (!allowed)) {
      return createErrorResponse(
        c,
        error || 'FORBIDDEN',
        'No permission to view this task',
      )
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

    // All the tasks under a list are owned by the list owner
    // So if the task is part of a list, the actual owner id is the list owner id
    let actualOwnerId = userInfo.id

    // If the task is part of a list, check if the user has permission to create it
    if (data.listId) {
      const list = await getListById(data.listId)
      if (!list) {
        return createErrorResponse(c, 'NOT_FOUND', 'List not found')
      }

      const isListOwner = actualOwnerId === list.ownerId

      // Only the owner can create tasks in a frozen list
      if (!isListOwner && list.isFrozen) {
        return createErrorResponse(
          c,
          'FORBIDDEN',
          'List is frozen and cannot be modified',
        )
      }

      // Only the owner can create tasks in a non-shared list
      if (!isListOwner && (!list.isShared || list.isFrozen)) {
        return createErrorResponse(
          c,
          'FORBIDDEN',
          'No permission to create task in this list',
        )
      }

      const collaborators = await getListCollaborators(list.id)
      const userCollaborator = collaborators.find(
        (collaborator) => collaborator.userId === userInfo.id,
      )

      const hasEditorPermission = userCollaborator?.role === 'editor'

      if (!isListOwner && !hasEditorPermission) {
        return createErrorResponse(
          c,
          'FORBIDDEN',
          'No permission to create task in this list',
        )
      }

      // Set the actual owner id to the list owner id
      actualOwnerId = list.ownerId
    }

    const task = await createTask({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: actualOwnerId,
    })

    if (!task) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }
    
    // Since task is the return value of createTask, which returns a single task, not an array
    // If the task is part of a list, broadcast the change to all users in the list
    if (task && task.listId) {
      const eventData = {
        type: 'task:create',
        task,
        timestamp: Date.now(),
        userId: userInfo.id,
        userName: userInfo.email || 'Unknown user' 
      }
      const messageStr = JSON.stringify(eventData)
      // Ensure listId is a string before calling broadcastToList
      if (task.listId && typeof task.listId === 'string') {
        broadcastToList(task.listId, messageStr, userInfo.id)
      }
    }

    return createSuccessResponse(c, task, 'Task created successfully', 201)
  },
)

// PATCH /api/tasks/:id - Update a task by id
export const updateTaskHandler = factory.createHandlers(
  zValidator('param', taskIdParamSchema),
  zValidator('json', updateTaskBodySchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')

    // Check if task exists
    const existingTask = await getTaskById(id)
    const isOwner = userInfo.id === existingTask?.userId

    if (!existingTask) {
      return createErrorResponse(c, 'NOT_FOUND')
    }

    const { allowed, error, list } = await checkListTaskPermission(
      existingTask,
      userInfo.id,
      'editor',
    )
    // If the user is not the owner and does not have permission, return forbidden
    if (!isOwner && (!allowed || list?.isFrozen)) {
      return createErrorResponse(c, error || 'FORBIDDEN')
    }

    // Handle due date: use the new one if provided, keep the existing one if not
    const dueDate = data.dueDate
      ? new Date(data.dueDate)
      : existingTask.dueDate
        ? new Date(existingTask.dueDate)
        : null

    const updatedTask = await updateTask(id, {
      ...existingTask,
      ...data,
      dueDate,
    })

    if (!updatedTask) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }
    
    // Broadcast task update event to other users
    if (updatedTask.listId) {
      const eventData = {
        type: 'task:update',
        task: updatedTask,
        timestamp: Date.now(),
        userId: userInfo.id,
        userName: userInfo.email || 'Unknown user'
      }
      const messageStr = JSON.stringify(eventData)
      
      // Broadcast the update to all users in the list
      if (typeof updatedTask.listId === 'string') {
        broadcastToList(updatedTask.listId, messageStr, userInfo.id)
      }
    }

    return createSuccessResponse(c, updatedTask)
  },
)

// PATCH /api/tasks/reorder - Reorder tasks
export const reorderTasksHandler = factory.createHandlers(
  zValidator('json', reorderTasksBodySchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { listId, tasks } = c.req.valid('json')

    // Special case for all-tasks view (listId is null or 'all-tasks')
    const isAllTasksView = !listId || listId === 'all-tasks'

    if (!isAllTasksView) {
      // Get the list to check permissions
      const list = await getListById(listId)
      if (!list) {
        return createErrorResponse(c, 'NOT_FOUND', 'List not found')
      }

      // Check if user is the owner or has editor permissions
      const isOwner = userInfo.id === list.ownerId

      // Only the owner can modify a frozen list
      if (!isOwner && list.isFrozen) {
        return createErrorResponse(
          c,
          'FORBIDDEN',
          'List is frozen and cannot be modified',
        )
      }

      // Only the owner can modify a non-shared list
      if (!isOwner && !list.isShared) {
        return createErrorResponse(
          c,
          'FORBIDDEN',
          'No permission to modify this list',
        )
      }

      // If not the owner, check if user is a collaborator with editor role
      if (!isOwner) {
        const collaborators = await getListCollaborators(list.id)
        const userCollaborator = collaborators.find(
          (collaborator) => collaborator.userId === userInfo.id,
        )

        const hasEditorPermission = userCollaborator?.role === 'editor'

        if (!hasEditorPermission) {
          return createErrorResponse(
            c,
            'FORBIDDEN',
            'No permission to modify tasks in this list',
          )
        }
      }
    } else {
      // For all-tasks view, verify that all tasks belong to the current user
      // This is a security measure to prevent users from modifying tasks they don't own
      for (const taskPosition of tasks) {
        const task = await getTaskById(taskPosition.id)
        if (!task) {
          return createErrorResponse(
            c,
            'NOT_FOUND',
            `Task ${taskPosition.id} not found`,
          )
        }

        // Check if the user owns this task
        if (task.userId !== userInfo.id) {
          return createErrorResponse(
            c,
            'FORBIDDEN',
            'No permission to modify this task',
          )
        }
      }
    }

    // Update the task positions
    const updatedTasks = await updateTaskPositions(tasks)

    if (!updatedTasks) {
      return createErrorResponse(
        c,
        'INTERNAL_SERVER_ERROR',
        'Failed to update task positions',
      )
    }
    
    // Only broadcast reordering events for list tasks (not for all-tasks view)
    if (!isAllTasksView) {
      const eventData = {
        type: 'task:reorder',
        tasks: updatedTasks,
        listId,
        timestamp: Date.now(),
        userId: userInfo.id,
        userName: userInfo.email || 'Unknown user'
      }
      const messageStr = JSON.stringify(eventData)
      
      // Broadcast the reordering to all users in the list
      broadcastToList(listId, messageStr, userInfo.id)
    }

    return createSuccessResponse(c, updatedTasks)
  },
)

// DELETE /api/tasks/:id - Delete a task by id
export const deleteTaskHandler = factory.createHandlers(
  zValidator('param', taskIdParamSchema),
  async (c) => {
    const userInfo = c.get('user' as any) as AuthenticatedUser
    const { id } = c.req.valid('param')

    // Check if task exists
    const existingTask = await getJustTask(id)
    if (!existingTask) {
      return createErrorResponse(c, 'NOT_FOUND')
    }

    const isOwner = userInfo.id === existingTask.userId
    const { allowed, error, list } = await checkListTaskPermission(
      existingTask,
      userInfo.id,
      'editor',
    )

    if (!isOwner && (!allowed || list?.isFrozen)) {
      return createErrorResponse(c, error || 'FORBIDDEN')
    }

    const deletedTask = await deleteTask(id)

    if (!deletedTask) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR', 'Task not deleted')
    }
    
    // Broadcast task delete event to other users
    if (existingTask.listId) {
      const eventData = {
        type: 'task:delete',
        taskId: id, // Use task ID directly since we know it exists
        timestamp: Date.now(),
        userId: userInfo.id,
        userName: userInfo.email || 'Unknown user'
      }
      const messageStr = JSON.stringify(eventData)
      
      // Broadcast the deletion to all users in the list
      if (typeof existingTask.listId === 'string') {
        broadcastToList(existingTask.listId, messageStr, userInfo.id)
      }
    }

    return createSuccessResponse(c, deletedTask)
  },
)
