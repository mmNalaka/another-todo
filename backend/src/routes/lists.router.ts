import { Hono } from 'hono'

import {
  addCollaboratorHandler,
  removeCollaboratorHandler,
  updateCollaboratorRoleHandler,
} from '@/controllers/collaborators.controller'
import {
  createListHandler,
  deleteListHandler,
  getAllListHandler,
  getListByIdHandler,
  toggleListFrozenHandler,
  updateListHandler,
} from '@/controllers/lists.controller'
import { authenticatedMiddleware } from '@/middlewares/authenticated.mw'

// /api/lists router
const lists = new Hono()

// Middleware
lists.use(authenticatedMiddleware())

lists.get('/', ...getAllListHandler)
lists.post('/', ...createListHandler)
lists.get('/:id', ...getListByIdHandler)
lists.patch('/:id', ...updateListHandler)
lists.delete('/:id', ...deleteListHandler)
lists.patch('/:id/toggle-frozen', ...toggleListFrozenHandler)

// Collaborator routes
lists.post('/:id/collaborators', ...addCollaboratorHandler)
lists.patch('/:id/collaborators/:userId', ...updateCollaboratorRoleHandler)
lists.delete('/:id/collaborators/:userId', ...removeCollaboratorHandler)

export default lists
