import { serve } from '@hono/node-server'
import pino from 'pino'

import app from '@/app'
import env from '@/config/env.config'
import { runMigrations } from '@/db/migrate'
import { hocuspocus } from '@/lib/realtime.lib'

const logger = pino()
const port = env.PORT

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
    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        // Handle WebSocket connections using Hocuspocus for real-time collaboration
        // https://tiptap.dev/docs/hocuspocus
        hocuspocus.hooks('onListen', {
          instance: hocuspocus,
          configuration: hocuspocus.configuration,
          port: info.port,
        })
      },
    )

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
