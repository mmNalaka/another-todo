import { appConfig } from '@/config/app.config'
import { factory } from '@/utils/hono.utils'

export const rootHandler = factory.createHandlers(async (c) => {
  return c.json({
    success: true,
    message: 'Welcome to Ubiquity TODOs REST API',
    data: {
      name: appConfig.name,
      version: appConfig.version,
    },
  })
})

export const healthHandler = factory.createHandlers(async (c) => {
  return c.json({
    success: true,
    message: 'OK',
  })
})
