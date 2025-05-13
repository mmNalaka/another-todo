import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuid } from 'drizzle-orm/pg-core/columns/uuid'

import { usersTable } from './users.schema'

export const refreshTokensTable = pgTable('refresh_tokens', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Refresh token type definitions
export type RefreshToken = typeof refreshTokensTable.$inferSelect
export type NewRefreshToken = typeof refreshTokensTable.$inferInsert

// repositories
