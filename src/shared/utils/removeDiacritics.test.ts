import { describe, expect, it } from 'vitest'

import { removeDiacritics } from '~/shared/utils/removeDiacritics'

describe('removeDiacritics', () => {
  it('removes accents from common pt-BR words', () => {
    expect(removeDiacritics('Tapioca doce')).toBe('Tapioca doce')
    expect(removeDiacritics('Tapioca doçe')).toBe('Tapioca doce')
    expect(removeDiacritics('Café com açúcar')).toBe('Cafe com acucar')
    expect(removeDiacritics('Pão de queijo')).toBe('Pao de queijo')
    expect(removeDiacritics('Fruta maçã')).toBe('Fruta maca')
  })
})
