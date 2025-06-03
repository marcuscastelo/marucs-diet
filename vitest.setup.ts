import { vi } from 'vitest'

vi.mock('solid-toast', () => ({
  __esModule: true,
  default: {
    error: () => {},
  },
}))
