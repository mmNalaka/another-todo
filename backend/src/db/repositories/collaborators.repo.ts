import { and, eq } from 'drizzle-orm'

import type { NewListCollaborator } from '@/db/schemas/tasks.schema'

import db from '@/db'
import { listCollaborators } from '@/db/schemas/tasks.schema'
import { usersTable } from '@/db/schemas/users.schema'

/**
 * Add a collaborator to a list
 */
export async function addCollaborator(data: NewListCollaborator) {
  return await db
    .insert(listCollaborators)
    .values(data)
    .returning()
    .then((res) => res[0])
}

/**
 * Get a collaborator by list ID and user ID
 */
export async function getCollaborator(listId: string, userId: string) {
  return await db
    .select()
    .from(listCollaborators)
    .where(
      and(
        eq(listCollaborators.listId, listId),
        eq(listCollaborators.userId, userId),
      ),
    )
    .limit(1)
    .then((res) => res[0])
}

/**
 * Update a collaborator's role
 */
export async function updateCollaboratorRole(
  listId: string,
  userId: string,
  role: string,
) {
  return await db
    .update(listCollaborators)
    .set({ role })
    .where(
      and(
        eq(listCollaborators.listId, listId),
        eq(listCollaborators.userId, userId),
      ),
    )
    .returning()
    .then((res) => res[0])
}

/**
 * Remove a collaborator from a list
 */
export async function removeCollaborator(listId: string, userId: string) {
  return await db
    .delete(listCollaborators)
    .where(
      and(
        eq(listCollaborators.listId, listId),
        eq(listCollaborators.userId, userId),
      ),
    )
    .returning()
    .then((res) => res[0])
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string) {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1)
    .then((res) => res[0])
}
