import { describe, expect, it } from 'vitest'

import {
  UserFutureBirthdateError,
  UserInvalidAgeError,
  UserInvalidBirthdateError,
  UserInvalidDesiredWeightError,
  UserInvalidDietError,
  UserInvalidFavoriteFoodsError,
  UserInvalidGenderError,
  UserInvalidNameError,
  UserTooManyFavoriteFoodsError,
  UserTooYoungError,
  UserUnrealisticDesiredWeightError,
} from '~/modules/user/domain/userErrors'
import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

describe('User Domain Errors', () => {
  describe('UserInvalidNameError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidNameError('')

      expect(error.message).toBe(
        "Nome do usuário inválido: ''. O nome deve ser uma string não vazia.",
      )
      expect(error.code).toBe('USER_INVALID_NAME')
      expect(error.context).toEqual({ name: '' })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle different invalid name values', () => {
      const testCases = [
        '',
        '   ',
        'a',
        '12345678901234567890123456789012345678901234567890',
      ]

      testCases.forEach((invalidName) => {
        const error = new UserInvalidNameError(invalidName)
        expect(error.message).toContain(invalidName)
        expect(error.context).toEqual({ name: invalidName })
      })
    })
  })

  describe('UserInvalidGenderError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidGenderError('unknown')

      expect(error.message).toBe(
        "Gênero do usuário inválido: 'unknown'. Deve ser 'male' ou 'female'.",
      )
      expect(error.code).toBe('USER_INVALID_GENDER')
      expect(error.context).toEqual({ gender: 'unknown' })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle various invalid gender values', () => {
      const testCases = [null, undefined, 123, 'other', 'M', 'F', '']

      testCases.forEach((invalidGender) => {
        const error = new UserInvalidGenderError(invalidGender)
        expect(error.message).toContain(String(invalidGender))
        expect(error.context).toEqual({ gender: invalidGender })
      })
    })
  })

  describe('UserInvalidDietError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidDietError('invalid-diet')

      expect(error.message).toBe(
        "Tipo de dieta inválido: 'invalid-diet'. Deve ser 'cut', 'normo' ou 'bulk'.",
      )
      expect(error.code).toBe('USER_INVALID_DIET')
      expect(error.context).toEqual({ diet: 'invalid-diet' })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle various invalid diet values', () => {
      const testCases = [null, undefined, 123, 'lose', 'gain', 'maintain', '']

      testCases.forEach((invalidDiet) => {
        const error = new UserInvalidDietError(invalidDiet)
        expect(error.message).toContain(String(invalidDiet))
        expect(error.context).toEqual({ diet: invalidDiet })
      })
    })
  })

  describe('UserInvalidBirthdateError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidBirthdateError('invalid-date')

      expect(error.message).toBe(
        'Data de nascimento inválida. Deve estar no formato YYYY-MM-DD.',
      )
      expect(error.code).toBe('USER_INVALID_BIRTHDATE')
      expect(error.context).toEqual({ birthdate: 'invalid-date' })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle various invalid birthdate values', () => {
      const testCases = [
        null,
        undefined,
        123,
        '01/01/1990',
        '1990-13-01',
        '2023-02-30',
        '',
      ]

      testCases.forEach((invalidBirthdate) => {
        const error = new UserInvalidBirthdateError(invalidBirthdate)
        expect(error.context).toEqual({ birthdate: invalidBirthdate })
      })
    })
  })

  describe('UserInvalidDesiredWeightError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidDesiredWeightError(-10)

      expect(error.message).toBe(
        'Peso desejado inválido. Deve ser um número positivo.',
      )
      expect(error.code).toBe('USER_INVALID_DESIRED_WEIGHT')
      expect(error.context).toEqual({ weight: -10 })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle various invalid weight values', () => {
      const testCases = [null, undefined, 'abc', -1, 0, -100]

      testCases.forEach((invalidWeight) => {
        const error = new UserInvalidDesiredWeightError(invalidWeight)
        expect(error.context).toEqual({ weight: invalidWeight })
      })
    })
  })

  describe('UserInvalidFavoriteFoodsError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidFavoriteFoodsError('not-an-array')

      expect(error.message).toBe(
        'Lista de alimentos favoritos inválida. Deve ser um array de IDs de alimentos.',
      )
      expect(error.code).toBe('USER_INVALID_FAVORITE_FOODS')
      expect(error.context).toEqual({ favoriteFoods: 'not-an-array' })
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('should handle various invalid favorite foods values', () => {
      const testCases = [
        null,
        undefined,
        'string',
        123,
        { invalid: 'object' },
        [1, 'two', 3],
      ]

      testCases.forEach((invalidFavoriteFoods) => {
        const error = new UserInvalidFavoriteFoodsError(invalidFavoriteFoods)
        expect(error.context).toEqual({ favoriteFoods: invalidFavoriteFoods })
      })
    })
  })

  describe('UserInvalidAgeError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserInvalidAgeError('1990-01-01', -5)

      expect(error.message).toBe(
        'Idade calculada inválida: -5 anos. Verifique a data de nascimento.',
      )
      expect(error.code).toBe('USER_INVALID_AGE')
      expect(error.context).toEqual({
        birthdate: '1990-01-01',
        calculatedAge: -5,
      })
      expect(error).toBeInstanceOf(BusinessRuleError)
    })

    it('should handle edge cases for invalid ages', () => {
      const testCases = [
        { birthdate: '2050-01-01', age: -27 },
        { birthdate: '1800-01-01', age: 223 },
        { birthdate: '1990-13-40', age: NaN },
      ]

      testCases.forEach(({ birthdate, age }) => {
        const error = new UserInvalidAgeError(birthdate, age)
        expect(error.context).toEqual({ birthdate, calculatedAge: age })
      })
    })
  })

  describe('UserUnrealisticDesiredWeightError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserUnrealisticDesiredWeightError(500, 30, 300)

      expect(error.message).toBe(
        'Peso desejado irrealista: 500kg. Deve estar entre 30kg e 300kg.',
      )
      expect(error.code).toBe('USER_UNREALISTIC_DESIRED_WEIGHT')
      expect(error.context).toEqual({
        weight: 500,
        minWeight: 30,
        maxWeight: 300,
      })
      expect(error).toBeInstanceOf(BusinessRuleError)
    })

    it('should handle boundary cases', () => {
      const testCases = [
        { weight: 29, min: 30, max: 300 }, // Below minimum
        { weight: 301, min: 30, max: 300 }, // Above maximum
        { weight: 0, min: 1, max: 1000 }, // Zero weight
      ]

      testCases.forEach(({ weight, min, max }) => {
        const error = new UserUnrealisticDesiredWeightError(weight, min, max)
        expect(error.context).toEqual({
          weight,
          minWeight: min,
          maxWeight: max,
        })
      })
    })
  })

  describe('UserTooManyFavoriteFoodsError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserTooManyFavoriteFoodsError(150, 100)

      expect(error.message).toBe(
        'Muitos alimentos favoritos: 150. Máximo permitido: 100.',
      )
      expect(error.code).toBe('USER_TOO_MANY_FAVORITE_FOODS')
      expect(error.context).toEqual({ count: 150, maxAllowed: 100 })
      expect(error).toBeInstanceOf(BusinessRuleError)
    })

    it('should handle edge cases', () => {
      const testCases = [
        { count: 101, max: 100 }, // Just over limit
        { count: 1000, max: 50 }, // Way over limit
        { count: 0, max: -1 }, // Invalid max limit
      ]

      testCases.forEach(({ count, max }) => {
        const error = new UserTooManyFavoriteFoodsError(count, max)
        expect(error.context).toEqual({ count, maxAllowed: max })
      })
    })
  })

  describe('UserFutureBirthdateError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserFutureBirthdateError('2050-01-01')

      expect(error.message).toBe(
        'Data de nascimento não pode ser no futuro: 2050-01-01.',
      )
      expect(error.code).toBe('USER_FUTURE_BIRTHDATE')
      expect(error.context).toEqual({ birthdate: '2050-01-01' })
      expect(error).toBeInstanceOf(BusinessRuleError)
    })

    it('should handle various future dates', () => {
      const testCases = ['2025-07-07', '2030-12-31', '2100-01-01']

      testCases.forEach((futureBirthdate) => {
        const error = new UserFutureBirthdateError(futureBirthdate)
        expect(error.context).toEqual({ birthdate: futureBirthdate })
      })
    })
  })

  describe('UserTooYoungError', () => {
    it('should create error with correct message and context', () => {
      const error = new UserTooYoungError(12, 18)

      expect(error.message).toBe(
        'Usuário muito jovem: 12 anos. Idade mínima: 18 anos.',
      )
      expect(error.code).toBe('USER_TOO_YOUNG')
      expect(error.context).toEqual({ age: 12, minAge: 18 })
      expect(error).toBeInstanceOf(BusinessRuleError)
    })

    it('should handle edge cases', () => {
      const testCases = [
        { age: 17, minAge: 18 }, // Just under minimum
        { age: 0, minAge: 13 }, // Newborn
        { age: -1, minAge: 18 }, // Invalid age
      ]

      testCases.forEach(({ age, minAge }) => {
        const error = new UserTooYoungError(age, minAge)
        expect(error.context).toEqual({ age, minAge })
      })
    })
  })

  describe('Error inheritance and types', () => {
    it('should have correct error types for validation errors', () => {
      const validationErrors = [
        new UserInvalidNameError(''),
        new UserInvalidGenderError('invalid'),
        new UserInvalidDietError('invalid'),
        new UserInvalidBirthdateError('invalid'),
        new UserInvalidDesiredWeightError(-1),
        new UserInvalidFavoriteFoodsError('invalid'),
      ]

      validationErrors.forEach((error) => {
        expect(error).toBeInstanceOf(ValidationError)
        expect(error).toBeInstanceOf(Error)
      })
    })

    it('should have correct error types for business rule errors', () => {
      const businessRuleErrors = [
        new UserInvalidAgeError('1990-01-01', -5),
        new UserUnrealisticDesiredWeightError(500, 30, 300),
        new UserTooManyFavoriteFoodsError(150, 100),
        new UserFutureBirthdateError('2050-01-01'),
        new UserTooYoungError(12, 18),
      ]

      businessRuleErrors.forEach((error) => {
        expect(error).toBeInstanceOf(BusinessRuleError)
        expect(error).toBeInstanceOf(Error)
      })
    })

    it('should maintain context data structure consistency', () => {
      const errors = [
        new UserInvalidNameError('test'),
        new UserInvalidGenderError('test'),
        new UserInvalidDietError('test'),
        new UserInvalidBirthdateError('test'),
        new UserInvalidDesiredWeightError('test'),
        new UserInvalidFavoriteFoodsError('test'),
        new UserInvalidAgeError('test', 0),
        new UserUnrealisticDesiredWeightError(0, 0, 0),
        new UserTooManyFavoriteFoodsError(0, 0),
        new UserFutureBirthdateError('test'),
        new UserTooYoungError(0, 0),
      ]

      errors.forEach((error) => {
        expect(error.context).toBeDefined()
        expect(typeof error.context).toBe('object')
        expect(error.code).toBeDefined()
        expect(typeof error.code).toBe('string')
      })
    })
  })
})
