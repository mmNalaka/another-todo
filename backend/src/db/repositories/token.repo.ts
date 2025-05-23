import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import db from '@/db'
import { refreshTokensTable } from '@/db/schemas/auth.schema'

/**
 * Store a refresh token in the database
 */
export async function storeRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  return await db.insert(refreshTokensTable).values({
    id: nanoid(),
    userId,
    token,
    expiresAt,
  })
}

/**
 * Get a refresh token from the database
 */
export async function getRefreshToken(token: string, userId: string) {
  return await db
    .select()
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.token, token),
        eq(refreshTokensTable.userId, userId),
      ),
    )
    .then((res) => res[0])
}

/**
 * Delete a refresh token from the database
 */
export async function deleteRefreshToken(token: string) {
  return await db
    .delete(refreshTokensTable)
    .where(eq(refreshTokensTable.token, token))
}

/**
 * Delete all refresh tokens for a user from the database
 */
export async function deleteAllRefreshTokens(userId: string) {
  return await db
    .delete(refreshTokensTable)
    .where(eq(refreshTokensTable.userId, userId))
}
