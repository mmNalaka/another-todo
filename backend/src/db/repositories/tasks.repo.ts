import { and, asc, desc, eq, isNull } from 'drizzle-orm'

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
    .orderBy(asc(tasksTable.position), desc(tasksTable.createdAt))
}

export async function getTaskById(taskId: string) {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId))

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
  id: string,
  data: Partial<NewTask>,
): Promise<NewTask | null> {
  try {
    const [updatedTask] = await db
      .update(tasksTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasksTable.id, id))
      .returning()

    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    return null
  }
}

/**
 * Update positions of multiple tasks in a transaction
 */
export async function updateTaskPositions(
  tasks: { id: string; position: number }[],
): Promise<NewTask[] | null> {
  try {
    // Use a transaction to ensure all updates succeed or fail together
    const updatedTasks = await db.transaction(async (tx) => {
      const results: NewTask[] = []
      
      // Update each task's position
      for (const task of tasks) {
        const [updatedTask] = await tx
          .update(tasksTable)
          .set({
            position: task.position,
            updatedAt: new Date(),
          })
          .where(eq(tasksTable.id, task.id))
          .returning()
        
        if (updatedTask) {
          results.push(updatedTask)
        }
      }
      
      return results
    })
    
    return updatedTasks
  } catch (error) {
    console.error('Error updating task positions:', error)
    return null
  }
}

export async function deleteTask(taskId: string) {
  return await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, taskId))
    .returning()
}
