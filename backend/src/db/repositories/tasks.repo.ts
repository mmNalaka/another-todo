import { and, eq } from 'drizzle-orm'

import type { NewTask } from '@/db/schemas/tasks.schema'

import db from '@/db'
import { tasksTable } from '@/db/schemas/tasks.schema'
import { generateListId } from '@/utils/id'

export async function getAllUserTasks(
  userId: string,
  limit?: number,
  offset?: number,
) {
  return await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.userId, userId))
    .limit(limit || 20)
    .offset(offset || 0)
    .orderBy(tasksTable.createdAt)
}

export async function getTaskById(taskId: string, userId: string) {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)))

  return task
}

export async function createTask(data: NewTask) {
  return await db
    .insert(tasksTable)
    .values({
      ...data,
      listId: data.listId || null,
      ...(!data.id && { id: generateListId() }),
    })
    .returning()
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: Partial<NewTask>,
) {
  return await db
    .update(tasksTable)
    .set(data)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)))
    .returning()
}

export async function deleteTask(taskId: string, userId: string) {
  return await db
    .delete(tasksTable)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)))
    .returning()
}
