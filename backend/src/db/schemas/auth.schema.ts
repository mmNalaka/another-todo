import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

import { usersTable } from './users.schema'

export const refreshTokensTable = pgTable('refresh_tokens', {
  id: text('id').primaryKey().default(nanoid()),
  userId: text('user_id')
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
