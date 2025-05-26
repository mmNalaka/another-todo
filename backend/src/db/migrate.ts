import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import pino from 'pino'

import env from '@/config/env.config'

const logger = pino()

/**
 * Run database migrations
 * @returns Promise that resolves when migrations are complete
 */
export async function runMigrations(): Promise<void> {
  logger.info('Starting database migrations')

  // Create a dedicated connection pool for migrations
  const migrationPool = new Pool({
    connectionString: env.DATABASE_URL,
    // Recommended settings for migrations
    max: 1, // Use a single connection for migrations
    idleTimeoutMillis: 15000, // Close idle connections after 15 seconds
  })

  try {
    const db = drizzle(migrationPool)

    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './src/db/migrations' })

    logger.info('Database migrations completed successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to run database migrations')
    throw error
  } finally {
    // Always close the pool when done
    await migrationPool.end()
  }
}

// Allow running migrations directly from command line
if (process.argv[1] === import.meta.url) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      logger.error({ error }, 'Migration script failed')
      process.exit(1)
    })
}
