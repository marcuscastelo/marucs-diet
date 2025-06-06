import { describe, it, expect } from 'vitest'
import { formatErrorForClipboard } from './clipboardErrorUtils'
import { ToastError } from './toastConfig'

describe('formatErrorForClipboard', () => {
  it('formats all fields correctly', () => {
    const error: ToastError = {
      message: 'Erro de teste',
      fullError: 'Stacktrace completo',
      context: { foo: 'bar', num: 42 },
      stack: 'stacktrace aqui',
      timestamp: 1717600000000,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Message: Erro de teste')
    expect(result).toContain('Details: Stacktrace completo')
    expect(result).toContain('Context:')
    expect(result).toContain('foo')
    expect(result).toContain('num')
    expect(result).toContain('Stack Trace:')
    expect(result).toContain('stacktrace aqui')
    expect(result).toContain('Timestamp: 2024-06-05T')
    expect(result).toContain('Error Report - ')
  })

  it('omits empty or duplicate fields', () => {
    const error: ToastError = {
      message: 'Erro',
      fullError: 'Erro',
      context: {},
      stack: '',
      timestamp: 0,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Message: Erro')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Context:')
    expect(result).not.toContain('Stack Trace:')
    expect(result).not.toContain('Timestamp:')
  })

  it('handles missing fields gracefully', () => {
    const error = {
      message: '',
      fullError: '',
      context: undefined,
      stack: undefined,
      timestamp: undefined,
    } as unknown as ToastError
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Error Report - ')
    expect(result).not.toContain('Message:')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Context:')
    expect(result).not.toContain('Stack Trace:')
    expect(result).not.toContain('Timestamp:')
  })

  it('handles only message', () => {
    const error: ToastError = {
      message: 'Apenas mensagem',
      fullError: '',
      context: {},
      stack: '',
      timestamp: 0,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Message: Apenas mensagem')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Context:')
    expect(result).not.toContain('Stack Trace:')
    expect(result).not.toContain('Timestamp:')
  })

  it('handles only stack', () => {
    const error: ToastError = {
      message: '',
      fullError: '',
      context: {},
      stack: 'stack only',
      timestamp: 0,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Stack Trace:')
    expect(result).toContain('stack only')
    expect(result).not.toContain('Message:')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Context:')
    expect(result).not.toContain('Timestamp:')
  })

  it('handles only context', () => {
    const error: ToastError = {
      message: '',
      fullError: '',
      context: { foo: 'bar' },
      stack: '',
      timestamp: 0,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Context:')
    expect(result).toContain('foo')
    expect(result).not.toContain('Message:')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Stack Trace:')
    expect(result).not.toContain('Timestamp:')
  })

  it('handles only timestamp', () => {
    const error: ToastError = {
      message: '',
      fullError: '',
      context: {},
      stack: '',
      timestamp: 1717600000000,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Timestamp: 2024-06-05T')
    expect(result).not.toContain('Message:')
    expect(result).not.toContain('Details:')
    expect(result).not.toContain('Context:')
    expect(result).not.toContain('Stack Trace:')
  })

  it('handles long message and multiline stack', () => {
    const error: ToastError = {
      message: 'Mensagem longa'.repeat(10),
      fullError: '',
      context: {},
      stack: 'line1\nline2\nline3',
      timestamp: 0,
    }
    const result = formatErrorForClipboard(error)
    expect(result).toContain('Mensagem longaMensagem longaMensagem longa')
    expect(result).toContain('Stack Trace:')
    expect(result).toContain('line1')
    expect(result).toContain('line2')
    expect(result).toContain('line3')
  })
})
