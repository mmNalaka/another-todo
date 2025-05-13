import { Hono } from 'hono'

import { getAllTasksHandler } from '@/controllers/tasks.controller'

// /api/tasks router
const tasksRouter = new Hono()

// GET / - Get all tasks for a user
tasksRouter.get('/', ...getAllTasksHandler)
// GET /:id - Get a task by id
tasksRouter.get('/:id', (c) => c.text(`GET /tasks/${c.req.param('id')}`))
// POST / - Create a new task
tasksRouter.post('/', (c) => c.text('POST /tasks'))
// PUT /:id - Update a task by id
tasksRouter.put('/:id', (c) => c.text(`PUT /tasks/${c.req.param('id')}`))
// DELETE /:id - Delete a task by id
tasksRouter.delete('/:id', (c) => c.text(`DELETE /tasks/${c.req.param('id')}`))

export default tasksRouter
