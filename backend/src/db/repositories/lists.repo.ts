import { eq } from 'drizzle-orm'

import type { NewTaskList } from '@/db/schemas/tasks.schema'

import db from '@/db'
import { tasksListsTable } from '@/db/schemas/tasks.schema'

export async function getAllPersonalLists(
  userId: string,
  limit?: number,
  offset?: number,
) {
  return await db
    .select()
    .from(tasksListsTable)
    .where(eq(tasksListsTable.ownerId, userId))
    .limit(limit || 20)
    .offset(offset || 0)
    .orderBy(tasksListsTable.createdAt)
}

export async function createPersonalList(data: NewTaskList) {
  return await db.insert(tasksListsTable).values(data).returning()
}
