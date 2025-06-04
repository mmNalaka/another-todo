import { serve } from '@hono/node-server'
import pino from 'pino'

import app, { injectWebSocket } from '@/app'
import env from '@/config/env.config'
import { runMigrations } from '@/db/migrate'

const logger = pino()
const port = env.PORT

const serverConfig = {
  fetch: app.fetch,
  port,
}

/**
 * Start the server after running migrations
 */
async function startServer() {
  try {
    // Run migrations before starting the server
    if (env.NODE_ENV === 'production') {
      await runMigrations()
    }

    // Start the server
    const server = serve(serverConfig)
    // Inject WebSocket
    injectWebSocket(server)

    logger.info(`Server is running on port http://localhost:${port}`)
  } catch (error) {
    logger.error({ error }, 'Failed to start server')
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception')
  process.exit(1)
})

// Start the server
startServer()
