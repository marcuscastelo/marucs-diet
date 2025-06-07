import { vi } from 'vitest'

vi.mock('solid-toast', () => ({
  __esModule: true,
  default: {
    error: () => {},
  },
}))

// Silence all console output during tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'info').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'debug').mockImplementation(() => {})
