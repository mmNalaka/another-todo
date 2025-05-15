import { Hono } from 'hono'

import { authenticatedMiddleware } from '@/middlewares/authenticated.mw'
import {
  createListHandler,
  getAllListHandler,
} from '@/controllers/lists.controller'

// /api/lists router
const lists = new Hono()

// Middleware
lists.use(authenticatedMiddleware())

lists.get('/', ...getAllListHandler)
lists.post('/', ...createListHandler)

export default lists
