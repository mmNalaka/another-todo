import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import env from '@/config/env'
import { usersTable } from '@/db/schemas/user'

// Schema
const schema = {
  users: usersTable,
} as const

// Create client
const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
})

// Create db
const db = drizzle(client, {
  schema,
})

export default db
