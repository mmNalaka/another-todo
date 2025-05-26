import { vi } from 'vitest'

/**
 * Creates a mock Hono context for testing
 */
export function createMockContext(overrides = {}) {
  const defaultContext = {
    req: {
      valid: vi.fn(() => ({})),
      query: vi.fn(() => ({})),
      param: vi.fn(() => ({})),
    },
    get: vi.fn(() => ({})),
    set: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    text: vi.fn(),
    redirect: vi.fn(),
    cookie: vi.fn(),
  }

  // Deep merge the overrides with the default context
  return {
    ...defaultContext,
    ...overrides,
    req: {
      ...defaultContext.req,
      ...(overrides.req || {}),
    },
  }
}
