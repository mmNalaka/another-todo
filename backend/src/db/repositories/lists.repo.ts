import { eq } from 'drizzle-orm'

import type { NewTaskList } from '@/db/schemas/tasks.schema'

import db from '@/db'
import {
  listCollaborators,
  tasksListsTable,
  tasksTable,
} from '@/db/schemas/tasks.schema'
import { usersTable } from '@/db/schemas/users.schema'
import { generateListId } from '@/utils/id'

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
  return await db
    .insert(tasksListsTable)
    .values({
      ...data,
      ...(!data.id && { id: generateListId() }),
    })
    .returning()
}

// Get the list by id, if the the user has permission to access it
export async function getListById(id: string) {
  return await db
    .select()
    .from(tasksListsTable)
    .where(eq(tasksListsTable.id, id))
    .limit(1)
    .then((res) => res[0])
}

// Get list collaborators
export async function getListCollaborators(id: string) {
  return await db
    .select({
      collaborator: listCollaborators,
      user: usersTable,
    })
    .from(listCollaborators)
    .innerJoin(usersTable, eq(listCollaborators.userId, usersTable.id))
    .where(eq(listCollaborators.listId, id))
}

// Get list tasks
export async function getListTasks(id: string) {
  return await db
    .select()
    .from(tasksListsTable)
    .innerJoin(tasksTable, eq(tasksListsTable.id, tasksTable.listId))
    .where(eq(tasksListsTable.id, id))
    .orderBy(tasksTable.createdAt)
    .then((res) => res.map((task) => task.tasks))
}
