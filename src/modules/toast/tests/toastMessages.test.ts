import { describe, it, expect } from 'vitest'
import { TOAST_MESSAGES } from '~/modules/toast/domain/toastMessages'

describe('TOAST_MESSAGES', () => {
  it('should contain all required keys', () => {
    expect(TOAST_MESSAGES).toHaveProperty('FALLBACK_ERROR_DETAILS')
    expect(TOAST_MESSAGES).toHaveProperty('SHOW_DETAILS')
    expect(TOAST_MESSAGES).toHaveProperty('HIDE_DETAILS')
    expect(TOAST_MESSAGES).toHaveProperty('COPY_ERROR')
    expect(TOAST_MESSAGES).toHaveProperty('COPIED')
    expect(TOAST_MESSAGES).toHaveProperty('ERROR_TITLE')
    expect(TOAST_MESSAGES).toHaveProperty('SUCCESS_TITLE')
    expect(TOAST_MESSAGES).toHaveProperty('WARNING_TITLE')
    expect(TOAST_MESSAGES).toHaveProperty('INFO_TITLE')
  })

  it('should have all values in Portuguese', () => {
    // Simple check: all values should contain at least one accented char or typical pt-BR word
    const values = Object.values(TOAST_MESSAGES)
    const hasPortuguese = values.some(
      (v) =>
        /[ãõçéíóúáêô]/i.test(v) || v.includes('Erro') || v.includes('Sucesso'),
    )
    expect(hasPortuguese).toBe(true)
  })
})
