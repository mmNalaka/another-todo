import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'

import { corsOptions } from '@/config/cors.config'
import { hocuspocus } from '@/lib/realtime.lib'
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

// WebSocket using hocuspocus for realtime collaboration
const { upgradeWebSocket } = createNodeWebSocket({ app })
app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen(_evt, ws) {
      if (!ws.raw) {
        return
      }
      hocuspocus.handleConnection(ws.raw, c.req.raw as any)
    },
  })),
)

// Global error handler
app.use(errorHandler())

export type AppType = typeof app
export default app
