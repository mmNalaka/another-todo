import { Hono } from 'hono'

import {
  createListHandler,
  getAllListHandler,
} from '@/controllers/lists.controller'
import { authenticatedMiddleware } from '@/middlewares/authenticated.mw'

// /api/lists router
const lists = new Hono()

// Middleware
lists.use(authenticatedMiddleware())

lists.get('/', ...getAllListHandler)
lists.post('/', ...createListHandler)

export default lists
