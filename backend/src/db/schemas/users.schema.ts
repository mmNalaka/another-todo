import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { uuid } from 'drizzle-orm/pg-core/columns/uuid'

// Users table
export const usersTable = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  avatar: text('avatar').notNull(),
  emailVerified: timestamp('email_verified', {
    withTimezone: true,
    mode: 'date',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User type definitions
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
