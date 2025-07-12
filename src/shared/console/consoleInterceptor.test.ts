import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearConsoleLogs,
  formatConsoleLogsForExport,
  getConsoleLogs,
  startConsoleInterception,
  stopConsoleInterception,
} from '~/shared/console/consoleInterceptor'

describe('Console Interceptor', () => {
  beforeEach(() => {
    clearConsoleLogs()
    startConsoleInterception()
    vi.clearAllMocks()
  })

  afterEach(() => {
    stopConsoleInterception()
    clearConsoleLogs()
  })

  it('should intercept console.log', () => {
    console.log('test message')
    const logs = getConsoleLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]?.level).toBe('log')
    expect(logs[0]?.message).toBe('test message')
  })

  it('should intercept console.error', () => {
    console.error('error message')
    const logs = getConsoleLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]?.level).toBe('error')
    expect(logs[0]?.message).toBe('error message')
  })

  it('should intercept console.warn', () => {
    console.warn('warning message')
    const logs = getConsoleLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]?.level).toBe('warn')
    expect(logs[0]?.message).toBe('warning message')
  })

  it('should format logs for export', () => {
    console.log('first message')
    console.error('second message')

    const formatted = formatConsoleLogsForExport()
    expect(formatted).toContain('[LOG] first message')
    expect(formatted).toContain('[ERROR] second message')
  })

  it('should handle object arguments', () => {
    const testObj = { foo: 'bar', baz: 123 }
    console.log('object test:', testObj)

    const logs = getConsoleLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]?.message).toContain('object test:')
    expect(logs[0]?.message).toContain('"foo":"bar"')
    expect(logs[0]?.message).toContain('"baz":123')
  })

  it('should clear logs', () => {
    console.log('test message')
    expect(getConsoleLogs()).toHaveLength(1)

    clearConsoleLogs()
    expect(getConsoleLogs()).toHaveLength(0)
  })
})
