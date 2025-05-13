import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuid } from 'drizzle-orm/pg-core/columns/uuid'

import { usersTable } from './users.schema'

// Tasks table
export const tasksTable = pgTable('tasks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),
})

// Tasks Lists table
export const tasksListsTable = pgTable('tasks_lists', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isFrozen: boolean('is_frozen').default(false),
  ownerId: uuid('owner_id')
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    })
    .notNull(),
})

// Tasks type definitions
export type Task = typeof tasksTable.$inferSelect
export type NewTask = typeof tasksTable.$inferInsert

export type TaskList = typeof tasksListsTable.$inferSelect
export type NewTaskList = typeof tasksListsTable.$inferInsert
