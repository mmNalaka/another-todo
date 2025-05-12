import { defineConfig } from 'drizzle-kit'

import env from '@/config/env'

export default defineConfig({
  schema: './src/schemas/*',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
