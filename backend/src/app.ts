import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'

import { corsOptions } from '@/config/cors.config'
import { errorHandler } from '@/middlewares/error-handler.mw'
import { pinoLogger } from '@/middlewares/pino-logger.mw'
import authRouter from '@/routes/auth.router'
import globalRoutes from '@/routes/global.routes'
import listsRoutes from '@/routes/lists.router'
import tasksRoutes from '@/routes/tasks.router'

const app = new Hono({
  strict: false,
})

// Middleware
app.use(requestId())
app.use(pinoLogger())
app.use(cors(corsOptions))

// Routes
app.route('/api/', globalRoutes)
app.route('/api/auth', authRouter)
app.route('/api/tasks', tasksRoutes)
app.route('/api/lists', listsRoutes)

// Global error handler
app.use(errorHandler())

export type AppType = typeof app
export default app
