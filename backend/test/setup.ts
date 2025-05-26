import dotenv from 'dotenv'
import { expand } from 'dotenv-expand'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

// Load environment variables for tests
const env = dotenv.config({ path: '.env.test' })
expand(env)

// Mock the database connection for tests
vi.mock('../src/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          first: vi.fn(),
          orderBy: vi.fn(),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              then: vi.fn(),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => ({
            first: vi.fn(),
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          execute: vi.fn(),
        })),
      })),
    })),
    transaction: vi.fn(),
  },
}))

beforeAll(() => {
  // Setup code before all tests run
})

afterAll(() => {
  // Cleanup code after all tests complete
})

beforeEach(() => {
  // Reset mocks before each test
  vi.resetAllMocks()
})

afterEach(() => {
  // Clean up after each test
})
