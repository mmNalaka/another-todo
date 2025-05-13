import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'

import { corsOptions } from '@/config/cors.config'
import { pinoLogger } from '@/middlewares/pino-logger.mw'
import globalRoutes from '@/routes/global.routes'

const app = new Hono({
  strict: false,
})

// Middleware
app.use(requestId())
app.use(pinoLogger())
app.use(cors(corsOptions))

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

// Routes
app.route('/', globalRoutes)

export type AppType = typeof app
export default app
