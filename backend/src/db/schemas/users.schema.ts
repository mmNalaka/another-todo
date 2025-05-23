import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// Users table
export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  avatar: text('avatar'),
  emailVerified: timestamp('email_verified', {
    withTimezone: true,
    mode: 'date',
  }),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User type definitions
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
