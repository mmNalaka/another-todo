import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'

import { corsOptions } from '@/config/cors.config'
import { pinoLogger } from '@/middlewares/pino-logger.mw'
import { errorHandler } from '@/middlewares/error-handler.mw'

import globalRoutes from '@/routes/global.routes'
import tasksRoutes from '@/routes/tasks.router'
import authRouter from './routes/auth.router'

const app = new Hono({
  strict: false,
})

// Middleware
app.use(requestId())
app.use(pinoLogger())
app.use(cors(corsOptions))

// Routes
app.route('/', globalRoutes)
app.route('/auth', authRouter)
app.route('/tasks', tasksRoutes)

// Global error handler
app.use(errorHandler())

export type AppType = typeof app
export default app
