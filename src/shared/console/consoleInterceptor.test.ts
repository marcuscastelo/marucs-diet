import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearConsoleLogs,
  downloadConsoleLogsAsFile,
  formatConsoleLogsForExport,
  getConsoleLogs,
  shareConsoleLogs,
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

  it('should download logs as file', () => {
    console.log('test log')

    // Mock DOM elements
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(mockLink),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    }

    const mockURL = {
      createObjectURL: vi.fn().mockReturnValue('mock-url'),
      revokeObjectURL: vi.fn(),
    }

    vi.stubGlobal('document', mockDocument)
    vi.stubGlobal('URL', mockURL)
    vi.stubGlobal('Blob', vi.fn())

    downloadConsoleLogsAsFile()

    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    expect(mockURL.createObjectURL).toHaveBeenCalled()
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should share logs on supported devices', async () => {
    console.log('test log')

    const mockShare = vi.fn().mockResolvedValue(undefined)
    const mockNavigator = { share: mockShare }

    vi.stubGlobal('navigator', mockNavigator)

    await shareConsoleLogs()

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Console Logs',
      text: expect.stringContaining('test log') as string,
    })
  })

  it('should throw error when share is not supported', () => {
    vi.stubGlobal('navigator', {})

    expect(() => shareConsoleLogs()).toThrow(
      'Share API não suportada neste dispositivo',
    )
  })
})
