import { describe, expect, it } from 'vitest'

import {
  createNewMacroProfile,
  demoteToNewMacroProfile,
  type MacroProfile,
  macroProfileSchema,
  type NewMacroProfile,
  newMacroProfileSchema,
  promoteToMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'

describe('MacroProfile Domain', () => {
  describe('macroProfileSchema', () => {
    it('should validate a valid macro profile object', () => {
      const validMacroProfile = {
        id: 1,
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(validMacroProfile)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(1)
        expect(result.data.owner).toBe(42)
        expect(result.data.target_day).toStrictEqual(new Date('2023-01-01'))
        expect(result.data.gramsPerKgCarbs).toBe(5.0)
        expect(result.data.gramsPerKgProtein).toBe(2.2)
        expect(result.data.gramsPerKgFat).toBe(1.0)
        expect(result.data.__type).toBe('MacroProfile')
      }
    })

    it('should transform string target_day to Date', () => {
      const macroProfileWithStringDate = {
        id: 1,
        owner: 42,
        target_day: '2023-01-01T00:00:00Z',
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(macroProfileWithStringDate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.target_day).toBeInstanceOf(Date)
        expect(result.data.target_day.toISOString()).toBe(
          '2023-01-01T00:00:00.000Z',
        )
      }
    })

    it('should transform negative gramsPerKg values to 0', () => {
      const macroProfileWithNegativeValues = {
        id: 1,
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: -2.5,
        gramsPerKgProtein: -1.8,
        gramsPerKgFat: -0.5,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(
        macroProfileWithNegativeValues,
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.gramsPerKgCarbs).toBe(0)
        expect(result.data.gramsPerKgProtein).toBe(0)
        expect(result.data.gramsPerKgFat).toBe(0)
      }
    })

    it('should fail validation with NaN gramsPerKg values', () => {
      const macroProfileWithNaNValues = {
        id: 1,
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: NaN,
        gramsPerKgProtein: NaN,
        gramsPerKgFat: NaN,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(macroProfileWithNaNValues)
      expect(result.success).toBe(false)
    })

    it('should validate typical macro profile values', () => {
      const typicalMacroProfiles = [
        // Standard balanced diet
        { gramsPerKgCarbs: 5.0, gramsPerKgProtein: 2.0, gramsPerKgFat: 1.0 },
        // High protein diet
        { gramsPerKgCarbs: 3.0, gramsPerKgProtein: 2.5, gramsPerKgFat: 1.2 },
        // Ketogenic diet
        { gramsPerKgCarbs: 0.5, gramsPerKgProtein: 1.8, gramsPerKgFat: 2.0 },
        // High carb athletic diet
        { gramsPerKgCarbs: 8.0, gramsPerKgProtein: 2.2, gramsPerKgFat: 0.8 },
        // Low fat diet
        { gramsPerKgCarbs: 6.0, gramsPerKgProtein: 2.0, gramsPerKgFat: 0.5 },
      ]

      typicalMacroProfiles.forEach((macros, index) => {
        const macroProfile = {
          id: index + 1,
          owner: 42,
          target_day: new Date('2023-01-01'),
          ...macros,
          __type: 'MacroProfile',
        }

        const result = macroProfileSchema.safeParse(macroProfile)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.gramsPerKgCarbs).toBe(macros.gramsPerKgCarbs)
          expect(result.data.gramsPerKgProtein).toBe(macros.gramsPerKgProtein)
          expect(result.data.gramsPerKgFat).toBe(macros.gramsPerKgFat)
        }
      })
    })

    it('should fail validation with missing required fields', () => {
      const invalidMacroProfile = {
        // Missing owner, target_day, gramsPerKg values
        id: 1,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(invalidMacroProfile)
      expect(result.success).toBe(false)
    })

    it('should fail validation with invalid field types', () => {
      const invalidMacroProfile = {
        id: 1,
        owner: 'not-a-number',
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(invalidMacroProfile)
      expect(result.success).toBe(false)
    })

    it('should handle invalid date format by creating Invalid Date', () => {
      const invalidMacroProfile = {
        id: 1,
        owner: 42,
        target_day: 'not-a-date',
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'MacroProfile',
      }

      const result = macroProfileSchema.safeParse(invalidMacroProfile)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.target_day).toBeInstanceOf(Date)
        expect(isNaN(result.data.target_day.getTime())).toBe(true) // Invalid Date
      }
    })
  })

  describe('newMacroProfileSchema', () => {
    it('should validate a valid new macro profile object', () => {
      const validNewMacroProfile = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
      }

      const result = newMacroProfileSchema.safeParse(validNewMacroProfile)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.owner).toBe(42)
        expect(result.data.target_day).toStrictEqual(new Date('2023-01-01'))
        expect(result.data.gramsPerKgCarbs).toBe(5.0)
        expect(result.data.gramsPerKgProtein).toBe(2.2)
        expect(result.data.gramsPerKgFat).toBe(1.0)
        expect(result.data.__type).toBe('NewMacroProfile')
      }
    })

    it('should transform string target_day to Date', () => {
      const newMacroProfileWithStringDate = {
        owner: 42,
        target_day: '2023-06-15T12:30:00Z',
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
      }

      const result = newMacroProfileSchema.safeParse(
        newMacroProfileWithStringDate,
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.target_day).toBeInstanceOf(Date)
        expect(result.data.target_day.toISOString()).toBe(
          '2023-06-15T12:30:00.000Z',
        )
      }
    })

    it('should apply negative value transformation', () => {
      const newMacroProfileWithNegativeValues = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: -3.0,
        gramsPerKgProtein: -2.5,
        gramsPerKgFat: -1.5,
        __type: 'NewMacroProfile',
      }

      const result = newMacroProfileSchema.safeParse(
        newMacroProfileWithNegativeValues,
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.gramsPerKgCarbs).toBe(0)
        expect(result.data.gramsPerKgProtein).toBe(0)
        expect(result.data.gramsPerKgFat).toBe(0)
      }
    })

    it('should ignore extra fields (not in strict mode)', () => {
      const newMacroProfileWithExtraField = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
        extraField: 'should be ignored',
      }

      const result = newMacroProfileSchema.safeParse(
        newMacroProfileWithExtraField,
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect('extraField' in result.data).toBe(false)
      }
    })

    it('should ignore id field (not in strict mode)', () => {
      const newMacroProfileWithId = {
        id: 1,
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
      }

      const result = newMacroProfileSchema.safeParse(newMacroProfileWithId)
      expect(result.success).toBe(true)
      if (result.success) {
        expect('id' in result.data).toBe(false)
      }
    })

    it('should fail validation with missing required fields', () => {
      const invalidNewMacroProfile = {
        __type: 'NewMacroProfile',
      }

      const result = newMacroProfileSchema.safeParse(invalidNewMacroProfile)
      expect(result.success).toBe(false)
    })
  })

  describe('createNewMacroProfile', () => {
    it('should create a valid NewMacroProfile', () => {
      const macroProfileProps = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
      }

      const newMacroProfile = createNewMacroProfile(macroProfileProps)

      expect(newMacroProfile.owner).toBe(42)
      expect(newMacroProfile.target_day).toStrictEqual(new Date('2023-01-01'))
      expect(newMacroProfile.gramsPerKgCarbs).toBe(5.0)
      expect(newMacroProfile.gramsPerKgProtein).toBe(2.2)
      expect(newMacroProfile.gramsPerKgFat).toBe(1.0)
      expect(newMacroProfile.__type).toBe('NewMacroProfile')
    })

    it('should handle different owner IDs', () => {
      const testCases = [1, 42, 999, 123456]

      testCases.forEach((owner) => {
        const newMacroProfile = createNewMacroProfile({
          owner,
          target_day: new Date('2023-01-01'),
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.0,
        })

        expect(newMacroProfile.owner).toBe(owner)
        expect(newMacroProfile.__type).toBe('NewMacroProfile')
      })
    })

    it('should handle different target dates', () => {
      const testDates = [
        new Date('2023-01-01'),
        new Date('2023-12-31'),
        new Date('2024-02-29'), // Leap year
        new Date('2023-06-15T12:30:45.123Z'), // With time
      ]

      testDates.forEach((target_day) => {
        const newMacroProfile = createNewMacroProfile({
          owner: 42,
          target_day,
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.0,
        })

        expect(newMacroProfile.target_day).toStrictEqual(target_day)
        expect(newMacroProfile.__type).toBe('NewMacroProfile')
      })
    })

    it('should handle different macro profile configurations', () => {
      const testCases = [
        // Standard balanced diet
        { gramsPerKgCarbs: 5.0, gramsPerKgProtein: 2.0, gramsPerKgFat: 1.0 },
        // High protein diet
        { gramsPerKgCarbs: 3.0, gramsPerKgProtein: 2.5, gramsPerKgFat: 1.2 },
        // Ketogenic diet
        { gramsPerKgCarbs: 0.5, gramsPerKgProtein: 1.8, gramsPerKgFat: 2.0 },
        // High carb athletic diet
        { gramsPerKgCarbs: 8.0, gramsPerKgProtein: 2.2, gramsPerKgFat: 0.8 },
        // Very low fat diet
        { gramsPerKgCarbs: 6.0, gramsPerKgProtein: 2.0, gramsPerKgFat: 0.3 },
        // Zero carb diet
        { gramsPerKgCarbs: 0.0, gramsPerKgProtein: 2.5, gramsPerKgFat: 1.8 },
      ]

      testCases.forEach((macros, index) => {
        const newMacroProfile = createNewMacroProfile({
          owner: 42,
          target_day: new Date('2023-01-01'),
          ...macros,
        })

        expect(newMacroProfile.gramsPerKgCarbs).toBe(macros.gramsPerKgCarbs)
        expect(newMacroProfile.gramsPerKgProtein).toBe(macros.gramsPerKgProtein)
        expect(newMacroProfile.gramsPerKgFat).toBe(macros.gramsPerKgFat)
        expect(newMacroProfile.__type).toBe('NewMacroProfile')
      })
    })

    it('should handle decimal precision in macro values', () => {
      const preciseValues = {
        gramsPerKgCarbs: 5.123456,
        gramsPerKgProtein: 2.987654,
        gramsPerKgFat: 1.555555,
      }

      const newMacroProfile = createNewMacroProfile({
        owner: 42,
        target_day: new Date('2023-01-01'),
        ...preciseValues,
      })

      expect(newMacroProfile.gramsPerKgCarbs).toBe(
        preciseValues.gramsPerKgCarbs,
      )
      expect(newMacroProfile.gramsPerKgProtein).toBe(
        preciseValues.gramsPerKgProtein,
      )
      expect(newMacroProfile.gramsPerKgFat).toBe(preciseValues.gramsPerKgFat)
    })
  })

  describe('promoteToMacroProfile', () => {
    it('should promote NewMacroProfile to MacroProfile', () => {
      const newMacroProfile: NewMacroProfile = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
      }

      const macroProfile = promoteToMacroProfile(newMacroProfile, { id: 123 })

      expect(macroProfile.id).toBe(123)
      expect(macroProfile.owner).toBe(42)
      expect(macroProfile.target_day).toStrictEqual(new Date('2023-01-01'))
      expect(macroProfile.gramsPerKgCarbs).toBe(5.0)
      expect(macroProfile.gramsPerKgProtein).toBe(2.2)
      expect(macroProfile.gramsPerKgFat).toBe(1.0)
      expect(macroProfile.__type).toBe('MacroProfile')
    })

    it('should handle different ID values', () => {
      const newMacroProfile: NewMacroProfile = {
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'NewMacroProfile',
      }

      const testIds = [1, 42, 999, 123456, 2147483647]

      testIds.forEach((id) => {
        const macroProfile = promoteToMacroProfile(newMacroProfile, { id })
        expect(macroProfile.id).toBe(id)
        expect(macroProfile.__type).toBe('MacroProfile')
      })
    })

    it('should preserve all original properties', () => {
      const newMacroProfile: NewMacroProfile = {
        owner: 999,
        target_day: new Date('2023-06-15T12:30:45.123Z'),
        gramsPerKgCarbs: 7.5,
        gramsPerKgProtein: 2.8,
        gramsPerKgFat: 1.3,
        __type: 'NewMacroProfile',
      }

      const macroProfile = promoteToMacroProfile(newMacroProfile, { id: 456 })

      expect(macroProfile.id).toBe(456)
      expect(macroProfile.owner).toBe(newMacroProfile.owner)
      expect(macroProfile.target_day).toStrictEqual(newMacroProfile.target_day)
      expect(macroProfile.gramsPerKgCarbs).toBe(newMacroProfile.gramsPerKgCarbs)
      expect(macroProfile.gramsPerKgProtein).toBe(
        newMacroProfile.gramsPerKgProtein,
      )
      expect(macroProfile.gramsPerKgFat).toBe(newMacroProfile.gramsPerKgFat)
      expect(macroProfile.__type).toBe('MacroProfile')
    })
  })

  describe('demoteToNewMacroProfile', () => {
    it('should demote MacroProfile to NewMacroProfile', () => {
      const macroProfile: MacroProfile = {
        id: 123,
        owner: 42,
        target_day: new Date('2023-01-01'),
        gramsPerKgCarbs: 5.0,
        gramsPerKgProtein: 2.2,
        gramsPerKgFat: 1.0,
        __type: 'MacroProfile',
      }

      const newMacroProfile = demoteToNewMacroProfile(macroProfile)

      expect(newMacroProfile.owner).toBe(42)
      expect(newMacroProfile.target_day).toStrictEqual(new Date('2023-01-01'))
      expect(newMacroProfile.gramsPerKgCarbs).toBe(5.0)
      expect(newMacroProfile.gramsPerKgProtein).toBe(2.2)
      expect(newMacroProfile.gramsPerKgFat).toBe(1.0)
      expect(newMacroProfile.__type).toBe('NewMacroProfile')
      expect('id' in newMacroProfile).toBe(false)
    })

    it('should preserve all original properties except id', () => {
      const macroProfile: MacroProfile = {
        id: 789,
        owner: 999,
        target_day: new Date('2023-06-15T12:30:45.123Z'),
        gramsPerKgCarbs: 7.5,
        gramsPerKgProtein: 2.8,
        gramsPerKgFat: 1.3,
        __type: 'MacroProfile',
      }

      const newMacroProfile = demoteToNewMacroProfile(macroProfile)

      expect(newMacroProfile.owner).toBe(macroProfile.owner)
      expect(newMacroProfile.target_day).toStrictEqual(macroProfile.target_day)
      expect(newMacroProfile.gramsPerKgCarbs).toBe(macroProfile.gramsPerKgCarbs)
      expect(newMacroProfile.gramsPerKgProtein).toBe(
        macroProfile.gramsPerKgProtein,
      )
      expect(newMacroProfile.gramsPerKgFat).toBe(macroProfile.gramsPerKgFat)
      expect(newMacroProfile.__type).toBe('NewMacroProfile')
      expect('id' in newMacroProfile).toBe(false)
    })
  })

  describe('Round-trip consistency', () => {
    it('should maintain data integrity through promote/demote cycle', () => {
      const originalNewMacroProfile: NewMacroProfile = {
        owner: 999,
        target_day: new Date('2023-06-15T12:30:45.123Z'),
        gramsPerKgCarbs: 7.5,
        gramsPerKgProtein: 2.8,
        gramsPerKgFat: 1.3,
        __type: 'NewMacroProfile',
      }

      // Promote to MacroProfile
      const macroProfile = promoteToMacroProfile(originalNewMacroProfile, {
        id: 456,
      })

      // Demote back to NewMacroProfile
      const demotedNewMacroProfile = demoteToNewMacroProfile(macroProfile)

      // Should match original (except __type which is structural)
      expect(demotedNewMacroProfile.owner).toBe(originalNewMacroProfile.owner)
      expect(demotedNewMacroProfile.target_day).toStrictEqual(
        originalNewMacroProfile.target_day,
      )
      expect(demotedNewMacroProfile.gramsPerKgCarbs).toBe(
        originalNewMacroProfile.gramsPerKgCarbs,
      )
      expect(demotedNewMacroProfile.gramsPerKgProtein).toBe(
        originalNewMacroProfile.gramsPerKgProtein,
      )
      expect(demotedNewMacroProfile.gramsPerKgFat).toBe(
        originalNewMacroProfile.gramsPerKgFat,
      )
      expect(demotedNewMacroProfile.__type).toBe('NewMacroProfile')
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle extreme macro values', () => {
      const extremeValues = [
        { gramsPerKgCarbs: 0, gramsPerKgProtein: 0, gramsPerKgFat: 0 },
        { gramsPerKgCarbs: 100, gramsPerKgProtein: 50, gramsPerKgFat: 25 },
        { gramsPerKgCarbs: 0.01, gramsPerKgProtein: 0.01, gramsPerKgFat: 0.01 },
        {
          gramsPerKgCarbs: 999.99,
          gramsPerKgProtein: 999.99,
          gramsPerKgFat: 999.99,
        },
      ]

      extremeValues.forEach((values, index) => {
        const newMacroProfile = createNewMacroProfile({
          owner: 42,
          target_day: new Date('2023-01-01'),
          ...values,
        })

        expect(newMacroProfile.gramsPerKgCarbs).toBe(values.gramsPerKgCarbs)
        expect(newMacroProfile.gramsPerKgProtein).toBe(values.gramsPerKgProtein)
        expect(newMacroProfile.gramsPerKgFat).toBe(values.gramsPerKgFat)
      })
    })

    it('should handle different date formats and times', () => {
      const testDates = [
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-12-31T23:59:59.999Z'),
        new Date('2024-02-29T12:00:00.000Z'), // Leap year
        new Date('1970-01-01T00:00:00.000Z'), // Unix epoch
        new Date('2099-12-31T23:59:59.999Z'), // Far future
      ]

      testDates.forEach((date) => {
        const newMacroProfile = createNewMacroProfile({
          owner: 42,
          target_day: date,
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.0,
        })

        expect(newMacroProfile.target_day).toStrictEqual(date)
      })
    })

    it('should handle high precision decimal values', () => {
      const preciseValues = {
        gramsPerKgCarbs: 5.123456789,
        gramsPerKgProtein: 2.987654321,
        gramsPerKgFat: 1.555555555,
      }

      const newMacroProfile = createNewMacroProfile({
        owner: 42,
        target_day: new Date('2023-01-01'),
        ...preciseValues,
      })

      expect(newMacroProfile.gramsPerKgCarbs).toBe(
        preciseValues.gramsPerKgCarbs,
      )
      expect(newMacroProfile.gramsPerKgProtein).toBe(
        preciseValues.gramsPerKgProtein,
      )
      expect(newMacroProfile.gramsPerKgFat).toBe(preciseValues.gramsPerKgFat)
    })

    it('should handle large owner ID values', () => {
      const largeOwnerIds = [
        Number.MAX_SAFE_INTEGER,
        2147483647, // 32-bit signed integer max
        4294967295, // 32-bit unsigned integer max
        999999999,
      ]

      largeOwnerIds.forEach((owner) => {
        const newMacroProfile = createNewMacroProfile({
          owner,
          target_day: new Date('2023-01-01'),
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.0,
        })

        expect(newMacroProfile.owner).toBe(owner)
      })
    })
  })

  describe('Business rule validation', () => {
    it('should validate common macro distribution patterns', () => {
      const commonPatterns = [
        // Balanced macronutrient distribution
        {
          name: 'Balanced',
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.0,
          gramsPerKgFat: 1.0,
        },
        // Athletic high-carb diet
        {
          name: 'Athletic',
          gramsPerKgCarbs: 8.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.2,
        },
        // Ketogenic diet
        {
          name: 'Ketogenic',
          gramsPerKgCarbs: 0.5,
          gramsPerKgProtein: 1.8,
          gramsPerKgFat: 2.0,
        },
        // High protein diet
        {
          name: 'High Protein',
          gramsPerKgCarbs: 3.0,
          gramsPerKgProtein: 2.5,
          gramsPerKgFat: 1.0,
        },
        // Low fat diet
        {
          name: 'Low Fat',
          gramsPerKgCarbs: 6.0,
          gramsPerKgProtein: 2.0,
          gramsPerKgFat: 0.5,
        },
      ]

      commonPatterns.forEach((pattern) => {
        const newMacroProfile = createNewMacroProfile({
          owner: 42,
          target_day: new Date('2023-01-01'),
          gramsPerKgCarbs: pattern.gramsPerKgCarbs,
          gramsPerKgProtein: pattern.gramsPerKgProtein,
          gramsPerKgFat: pattern.gramsPerKgFat,
        })

        expect(newMacroProfile.gramsPerKgCarbs).toBe(pattern.gramsPerKgCarbs)
        expect(newMacroProfile.gramsPerKgProtein).toBe(
          pattern.gramsPerKgProtein,
        )
        expect(newMacroProfile.gramsPerKgFat).toBe(pattern.gramsPerKgFat)
      })
    })

    it('should validate macro profiles for different user types', () => {
      const userTypes = [
        // Sedentary adult
        {
          type: 'Sedentary',
          gramsPerKgCarbs: 4.0,
          gramsPerKgProtein: 1.6,
          gramsPerKgFat: 1.0,
        },
        // Moderately active adult
        {
          type: 'Moderate',
          gramsPerKgCarbs: 5.5,
          gramsPerKgProtein: 2.0,
          gramsPerKgFat: 1.2,
        },
        // Highly active athlete
        {
          type: 'Athlete',
          gramsPerKgCarbs: 7.0,
          gramsPerKgProtein: 2.2,
          gramsPerKgFat: 1.5,
        },
        // Endurance athlete
        {
          type: 'Endurance',
          gramsPerKgCarbs: 8.5,
          gramsPerKgProtein: 2.0,
          gramsPerKgFat: 1.0,
        },
        // Strength athlete
        {
          type: 'Strength',
          gramsPerKgCarbs: 5.0,
          gramsPerKgProtein: 2.5,
          gramsPerKgFat: 1.3,
        },
      ]

      userTypes.forEach((userType, index) => {
        const newMacroProfile = createNewMacroProfile({
          owner: index + 1,
          target_day: new Date('2023-01-01'),
          gramsPerKgCarbs: userType.gramsPerKgCarbs,
          gramsPerKgProtein: userType.gramsPerKgProtein,
          gramsPerKgFat: userType.gramsPerKgFat,
        })

        // Verify the profile is valid for the user type
        expect(newMacroProfile.gramsPerKgCarbs).toBe(userType.gramsPerKgCarbs)
        expect(newMacroProfile.gramsPerKgProtein).toBe(
          userType.gramsPerKgProtein,
        )
        expect(newMacroProfile.gramsPerKgFat).toBe(userType.gramsPerKgFat)
        expect(newMacroProfile.owner).toBe(index + 1)
      })
    })
  })
})
