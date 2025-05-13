import { Hono } from 'hono'
import { rootHandler, healthHandler } from '@/controllers/global.controller'

const globalRoutes = new Hono()

globalRoutes.get('/', ...rootHandler)
globalRoutes.get('/health', ...healthHandler)

export default globalRoutes
