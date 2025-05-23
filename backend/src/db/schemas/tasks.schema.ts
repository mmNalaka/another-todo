import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { usersTable } from '@/db/schemas/users.schema'

// Tasks lists table
export const tasksListsTable = pgTable(
  'tasks_lists',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    isFrozen: boolean('is_frozen').default(false),
    isShared: boolean('is_shared').default(false),
    color: text('color'),
    schema: jsonb('schema'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    idx_owner_id: index('idx_lists_owner_id').on(table.ownerId),
  }),
)

// Tasks table
export const tasksTable = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    listId: text('list_id').references(() => tasksListsTable.id, {
      onDelete: 'set null',
    }),
    parentTaskId: text('parent_task_id'),
    title: text('title').notNull(),
    description: text('description'),
    value: numeric('value'),
    isCompleted: boolean('is_completed').default(false),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    idx_user_id: index('idx_tasks_user_id').on(table.userId),
    idx_list_id: index('idx_tasks_list_id').on(table.listId),
    idx_parent_task_id: index('idx_tasks_parent_task_id').on(
      table.parentTaskId,
    ),
    idx_list_parent_position: index('idx_tasks_list_parent_position').on(
      table.listId,
      table.parentTaskId,
      table.position,
    ),
    parentTaskId: foreignKey({
      name: 'parent_task_fk',
      columns: [table.parentTaskId],
      foreignColumns: [table.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  }),
)

// List collaborators table
export const listCollaborators = pgTable(
  'list_collaborators',
  {
    listId: text('list_id')
      .notNull()
      .references(() => tasksListsTable.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    role: text('role').default('editor'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.listId, table.userId] }),
    idx_user_id: index('idx_list_collaborators_user_id').on(table.userId),
  }),
)

// Type definitions
export type TasksList = typeof tasksListsTable.$inferSelect
export type NewTaskList = typeof tasksListsTable.$inferInsert

export type Task = typeof tasksTable.$inferSelect
export type NewTask = typeof tasksTable.$inferInsert

export type ListCollaborator = typeof listCollaborators.$inferSelect
export type NewListCollaborator = typeof listCollaborators.$inferInsert
