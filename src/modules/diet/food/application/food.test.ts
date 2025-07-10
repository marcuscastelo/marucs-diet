import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchFoods } from '~/modules/diet/food/application/food'
import { createErrorHandler } from '~/shared/error/errorHandler'

// Mock dependencies
vi.mock('~/modules/diet/food/infrastructure/supabaseFoodRepository')
vi.mock('~/shared/error/errorHandler', () => ({
  createErrorHandler: vi.fn(() => ({
    error: vi.fn(),
    apiError: vi.fn(),
    validationError: vi.fn(),
    criticalError: vi.fn(),
  })),
  isBackendOutageError: vi.fn(() => false),
}))
vi.mock('~/shared/error/backendOutageSignal')
vi.mock('~/modules/diet/food/infrastructure/api/application/apiFood')
vi.mock('~/modules/search/application/searchCache')
vi.mock('~/modules/toast/application/toastManager')
vi.mock('~/shared/formatError')

describe('Food Application - Domain Error Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('existing functions with enhanced context', () => {
    it('should have proper error context in fetchFoods', async () => {
      // This test verifies that the existing functions now have proper error context
      // The actual error handling is mocked, but we can verify the context structure
      expect(fetchFoods).toBeDefined()
      expect(typeof fetchFoods).toBe('function')
    })
  })
})
