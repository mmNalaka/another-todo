import { eq, isNull, and } from 'drizzle-orm'

import type { NewTaskList, TasksList } from '@/db/schemas/tasks.schema'

import db from '@/db'
import {
  listCollaborators,
  tasksListsTable,
  tasksTable,
} from '@/db/schemas/tasks.schema'
import { usersTable } from '@/db/schemas/users.schema'
import { generateListId } from '@/utils/id'

// Get all lists for a user - both owned and shared with them
export async function getAllPersonalLists(
  userId: string,
  limit?: number,
  offset?: number,
) {
  // First get lists owned by the user
  const ownedLists = await db
    .select()
    .from(tasksListsTable)
    .where(eq(tasksListsTable.ownerId, userId))
    .orderBy(tasksListsTable.createdAt);

  // Then get lists where the user is a collaborator
  const collaborativeLists = await db
    .select({
      list: tasksListsTable
    })
    .from(tasksListsTable)
    .innerJoin(
      listCollaborators,
      eq(tasksListsTable.id, listCollaborators.listId)
    )
    .where(eq(listCollaborators.userId, userId))
    .orderBy(tasksListsTable.createdAt)
    .then(rows => rows.map(row => row.list));

  // Combine both lists and apply pagination
  const allLists = [...ownedLists, ...collaborativeLists];
  
  return allLists;
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
    .then((res) =>
      res.map((u) => ({
        ...u.collaborator,
        name: u.user.name,
        email: u.user.email,
      })),
    )
}

// Get list tasks
export async function getListTasks(id: string) {
  return await db
    .select()
    .from(tasksListsTable)
    .innerJoin(tasksTable, eq(tasksListsTable.id, tasksTable.listId))
    .where(and(eq(tasksListsTable.id, id), isNull(tasksTable.parentTaskId)))
    .orderBy(tasksTable.createdAt)
    .then((res) => res.map((task) => task.tasks))
}

// Update a list by ID
export async function updateList(
  id: string,
  data: Partial<Omit<TasksList, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>,
) {
  return await db
    .update(tasksListsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasksListsTable.id, id))
    .returning()
    .then((res) => res[0])
}

// Delete a list by ID
export async function deleteList(id: string) {
  return await db
    .delete(tasksListsTable)
    .where(eq(tasksListsTable.id, id))
    .returning()
    .then((res) => res[0])
}
