import { Hono } from 'hono'

import {
  createTaskHandler,
  deleteTaskHandler,
  getAllTasksHandler,
  getTaskByIdHandler,
  reorderTasksHandler,
  updateTaskHandler,
} from '@/controllers/tasks.controller'
import { authenticatedMiddleware } from '@/middlewares/authenticated.mw'

// /api/tasks router
const tasksRouter = new Hono()

// Apply authentication middleware to all routes
tasksRouter.use(authenticatedMiddleware())

// GET / - Get all tasks for a user
tasksRouter.get('/', ...getAllTasksHandler)
// GET /:id - Get a task by id
tasksRouter.get('/:id', ...getTaskByIdHandler)
// POST / - Create a new task
tasksRouter.post('/', ...createTaskHandler)

// PATCH /reorder - Reorder tasks (must come before /:id route)
tasksRouter.patch('/reorder', ...reorderTasksHandler)

// PATCH /:id - Update a task by id
tasksRouter.patch('/:id', ...updateTaskHandler)

// DELETE /:id - Delete a task by id
tasksRouter.delete('/:id', ...deleteTaskHandler)

export default tasksRouter
