import db from '@/db'
import { NewUser, usersTable } from '@/db/schemas/users.schema'
import { eq } from 'drizzle-orm'

export const getUserByEmail = async (email: string) => {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((res) => res[0])
}

export const createNewUser = async (data: NewUser) => {
  return await db
    .insert(usersTable)
    .values(data)
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      createdAt: usersTable.createdAt,
      emailVerified: usersTable.emailVerified,
      avatar: usersTable.avatar,
    })
    .then((res) => res[0])
}
