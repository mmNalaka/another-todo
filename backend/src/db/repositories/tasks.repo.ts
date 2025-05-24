import { and, eq, isNull } from 'drizzle-orm'

import type { NewTask } from '@/db/schemas/tasks.schema'

import db from '@/db'
import { tasksTable } from '@/db/schemas/tasks.schema'
import { generateTaskId } from '@/utils/id'

export async function getAllUserTasks(
  userId: string,
  limit?: number,
  offset?: number,
) {
  return await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.userId, userId),
        isNull(tasksTable.parentTaskId),
        isNull(tasksTable.listId),
      ),
    )
    .limit(limit || 20)
    .offset(offset || 0)
    .orderBy(tasksTable.createdAt)
}

export async function getTaskById(taskId: string, userId: string) {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)))

  const subTasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.parentTaskId, taskId))
    .orderBy(tasksTable.createdAt)

  let parentTask = null
  if (task.parentTaskId) {
    parentTask = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task.parentTaskId))
      .limit(1)
      .then((res) => res[0])
  }

  return {
    ...task,
    subTasks,
    parentTask,
  }
}

export async function createTask(data: Omit<NewTask, 'id'>) {
  return await db
    .insert(tasksTable)
    .values({
      id: generateTaskId(),
      listId: data.listId || null,
      ...data,
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
