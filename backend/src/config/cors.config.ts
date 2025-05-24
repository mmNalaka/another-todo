import type { cors } from 'hono/cors'

type CORSOptions = Parameters<typeof cors>[0]

export const corsOptions: CORSOptions = {
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}
