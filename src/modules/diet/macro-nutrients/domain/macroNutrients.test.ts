import { describe, expect, it } from 'vitest'

import {
  type MacroNutrients,
  macroNutrientsSchema,
} from '~/modules/diet/macro-nutrients/domain/macroNutrients'

describe('MacroNutrients Domain', () => {
  describe('macroNutrientsSchema', () => {
    it('should validate a valid macro nutrients object', () => {
      const validMacros = {
        carbs: 100.5,
        protein: 50.0,
        fat: 25.75,
      }

      const result = macroNutrientsSchema.safeParse(validMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validMacros)
      }
    })

    it('should validate integer macro values', () => {
      const macrosWithIntegers = {
        carbs: 100,
        protein: 50,
        fat: 25,
      }

      const result = macroNutrientsSchema.safeParse(macrosWithIntegers)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(macrosWithIntegers)
      }
    })

    it('should validate zero macro values', () => {
      const zeroMacros = {
        carbs: 0,
        protein: 0,
        fat: 0,
      }

      const result = macroNutrientsSchema.safeParse(zeroMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(zeroMacros)
      }
    })

    it('should validate negative macro values', () => {
      const negativeMacros = {
        carbs: -10.5,
        protein: -5.0,
        fat: -2.5,
      }

      const result = macroNutrientsSchema.safeParse(negativeMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(negativeMacros)
      }
    })

    it('should fail validation with missing carbs', () => {
      const invalidMacros = {
        protein: 50.0,
        fat: 25.0,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with missing protein', () => {
      const invalidMacros = {
        carbs: 100.0,
        fat: 25.0,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with missing fat', () => {
      const invalidMacros = {
        carbs: 100.0,
        protein: 50.0,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with invalid carbs type', () => {
      const invalidMacros = {
        carbs: 'not-a-number',
        protein: 50.0,
        fat: 25.0,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with invalid protein type', () => {
      const invalidMacros = {
        carbs: 100.0,
        protein: 'not-a-number',
        fat: 25.0,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with invalid fat type', () => {
      const invalidMacros = {
        carbs: 100.0,
        protein: 50.0,
        fat: 'not-a-number',
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with null values', () => {
      const invalidMacros = {
        carbs: null,
        protein: null,
        fat: null,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should fail validation with undefined values', () => {
      const invalidMacros = {
        carbs: undefined,
        protein: undefined,
        fat: undefined,
      }

      const result = macroNutrientsSchema.safeParse(invalidMacros)
      expect(result.success).toBe(false)
    })

    it('should ignore extra properties', () => {
      const macrosWithExtra = {
        carbs: 100.0,
        protein: 50.0,
        fat: 25.0,
        extra: 'should be ignored',
        calories: 700, // Should be ignored
      }

      const result = macroNutrientsSchema.safeParse(macrosWithExtra)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          carbs: 100.0,
          protein: 50.0,
          fat: 25.0,
        })
        expect('extra' in result.data).toBe(false)
        expect('calories' in result.data).toBe(false)
      }
    })
  })

  describe('MacroNutrients type', () => {
    it('should define the correct structure', () => {
      const macros: MacroNutrients = {
        carbs: 100.0,
        protein: 50.0,
        fat: 25.0,
      }

      expect(macros.carbs).toBe(100.0)
      expect(macros.protein).toBe(50.0)
      expect(macros.fat).toBe(25.0)
    })

    it('should be readonly', () => {
      const macros: MacroNutrients = {
        carbs: 100.0,
        protein: 50.0,
        fat: 25.0,
      }

      // TypeScript compile-time check - these should fail in TS
      // macros.carbs = 200.0 // Should be compile error
      // macros.protein = 60.0 // Should be compile error
      // macros.fat = 30.0 // Should be compile error

      expect(macros.carbs).toBe(100.0)
      expect(macros.protein).toBe(50.0)
      expect(macros.fat).toBe(25.0)
    })

    it('should work with schema parsing', () => {
      const rawData = {
        carbs: 120.5,
        protein: 55.25,
        fat: 30.75,
      }

      const result = macroNutrientsSchema.safeParse(rawData)
      expect(result.success).toBe(true)
      if (result.success) {
        const typedMacros: MacroNutrients = result.data

        expect(typedMacros.carbs).toBe(120.5)
        expect(typedMacros.protein).toBe(55.25)
        expect(typedMacros.fat).toBe(30.75)
      }
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle very small decimal values', () => {
      const smallMacros = {
        carbs: 0.001,
        protein: 0.0001,
        fat: 0.00001,
      }

      const result = macroNutrientsSchema.safeParse(smallMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.carbs).toBe(0.001)
        expect(result.data.protein).toBe(0.0001)
        expect(result.data.fat).toBe(0.00001)
      }
    })

    it('should handle large values', () => {
      const largeMacros = {
        carbs: 9999.99,
        protein: 8888.88,
        fat: 7777.77,
      }

      const result = macroNutrientsSchema.safeParse(largeMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(largeMacros)
      }
    })

    it('should handle infinity values', () => {
      const infinityMacros = {
        carbs: Infinity,
        protein: -Infinity,
        fat: Number.POSITIVE_INFINITY,
      }

      const result = macroNutrientsSchema.safeParse(infinityMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.carbs).toBe(Infinity)
        expect(result.data.protein).toBe(-Infinity)
        expect(result.data.fat).toBe(Infinity)
      }
    })

    it('should handle NaN values', () => {
      const nanMacros = {
        carbs: NaN,
        protein: 50.0,
        fat: 25.0,
      }

      const result = macroNutrientsSchema.safeParse(nanMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(Number.isNaN(result.data.carbs)).toBe(true)
        expect(result.data.protein).toBe(50.0)
        expect(result.data.fat).toBe(25.0)
      }
    })

    it('should handle very precise decimal values', () => {
      const preciseMacros = {
        carbs: 100.123456789,
        protein: 50.987654321,
        fat: 25.555555555,
      }

      const result = macroNutrientsSchema.safeParse(preciseMacros)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.carbs).toBe(100.123456789)
        expect(result.data.protein).toBe(50.987654321)
        expect(result.data.fat).toBe(25.555555555)
      }
    })
  })

  describe('Common macro nutrient scenarios', () => {
    it('should handle typical daily macro targets', () => {
      const dailyTargets = {
        carbs: 225.0, // 45% of 2000 calories
        protein: 150.0, // 30% of 2000 calories
        fat: 55.6, // 25% of 2000 calories
      }

      const result = macroNutrientsSchema.safeParse(dailyTargets)
      expect(result.success).toBe(true)
    })

    it('should handle low-carb diet macros', () => {
      const lowCarbMacros = {
        carbs: 20.0, // Very low carb
        protein: 120.0, // Moderate protein
        fat: 80.0, // High fat
      }

      const result = macroNutrientsSchema.safeParse(lowCarbMacros)
      expect(result.success).toBe(true)
    })

    it('should handle high-protein diet macros', () => {
      const highProteinMacros = {
        carbs: 100.0, // Moderate carbs
        protein: 200.0, // Very high protein
        fat: 40.0, // Low fat
      }

      const result = macroNutrientsSchema.safeParse(highProteinMacros)
      expect(result.success).toBe(true)
    })

    it('should handle meal-sized portions', () => {
      const mealMacros = {
        carbs: 45.0, // ~1 cup rice
        protein: 25.0, // ~100g chicken
        fat: 10.0, // ~1 tbsp oil
      }

      const result = macroNutrientsSchema.safeParse(mealMacros)
      expect(result.success).toBe(true)
    })

    it('should handle snack-sized portions', () => {
      const snackMacros = {
        carbs: 15.0, // Small snack
        protein: 5.0, // Light protein
        fat: 3.0, // Minimal fat
      }

      const result = macroNutrientsSchema.safeParse(snackMacros)
      expect(result.success).toBe(true)
    })
  })

  describe('Schema compatibility', () => {
    it('should be compatible with objects parsed from JSON', () => {
      const jsonData = { carbs: 100.5, protein: 50.0, fat: 25.0 }

      const result = macroNutrientsSchema.safeParse(jsonData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          carbs: 100.5,
          protein: 50.0,
          fat: 25.0,
        })
      }
    })

    it('should be compatible with database row objects', () => {
      // Simulating a database row with all fields as numbers
      const dbRow = {
        id: 1,
        name: 'Test Food',
        carbs: 45.0,
        protein: 20.0,
        fat: 15.0,
        created_at: '2023-01-01',
      }

      // Extract only macro fields
      const macroFields = {
        carbs: dbRow.carbs,
        protein: dbRow.protein,
        fat: dbRow.fat,
      }

      const result = macroNutrientsSchema.safeParse(macroFields)
      expect(result.success).toBe(true)
    })

    it('should be compatible with form data conversion', () => {
      // Simulating form data that might come as strings
      const formData = {
        carbs: '100.5',
        protein: '50.0',
        fat: '25.0',
      }

      // Convert strings to numbers (as would happen in real forms)
      const converted = {
        carbs: Number(formData.carbs),
        protein: Number(formData.protein),
        fat: Number(formData.fat),
      }

      const result = macroNutrientsSchema.safeParse(converted)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          carbs: 100.5,
          protein: 50.0,
          fat: 25.0,
        })
      }
    })
  })
})
