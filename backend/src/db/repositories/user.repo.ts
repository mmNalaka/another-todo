import type { UUID } from 'node:crypto'

import { eq } from 'drizzle-orm'

import type { NewUser } from '@/db/schemas/users.schema'

import db from '@/db'
import { usersTable } from '@/db/schemas/users.schema'

const userReturnSchema = {
  id: usersTable.id,
  email: usersTable.email,
  name: usersTable.name,
  createdAt: usersTable.createdAt,
  emailVerified: usersTable.emailVerified,
  avatar: usersTable.avatar,
}

export async function getUserByEmail(email: string) {
  return await db
    .select(userReturnSchema)
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((res) => res[0])
}

export async function getUserById(id: UUID) {
  return await db
    .select(userReturnSchema)
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .then((res) => res[0])
}

export async function createNewUser(data: NewUser) {
  return await db
    .insert(usersTable)
    .values(data)
    .returning(userReturnSchema)
    .then((res) => res[0])
}
