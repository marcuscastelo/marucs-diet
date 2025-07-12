import { describe, expect, it } from 'vitest'

import {
  createItem,
  type Item,
  itemSchema,
} from '~/modules/diet/item/domain/item'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

describe('Item Domain', () => {
  describe('itemSchema', () => {
    it('should transform null __type to Item', () => {
      const itemWithNullType = {
        id: 1,
        name: 'Test Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
        __type: null,
      }

      const result = itemSchema.safeParse(itemWithNullType)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.__type).toBe('Item')
      }
    })

    it('should transform undefined __type to Item', () => {
      const itemWithUndefinedType = {
        id: 1,
        name: 'Test Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
        __type: undefined,
      }

      const result = itemSchema.safeParse(itemWithUndefinedType)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.__type).toBe('Item')
      }
    })
  })

  describe('createItem', () => {
    it('should create a valid Item with all parameters', () => {
      const item = createItem({
        name: 'Test Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
      })

      expect(typeof item.id).toBe('number')
      expect(item.id).toBeGreaterThan(0)
      expect(item.name).toBe('Test Item')
      expect(item.reference).toBe(42)
      expect(item.quantity).toBe(100)
      expect(item.macros.protein).toBe(10)
      expect(item.macros.carbs).toBe(30)
      expect(item.macros.fat).toBe(5)
      expect(item.__type).toBe('Item')
    })

    it('should create a valid Item with minimal parameters', () => {
      const item = createItem({
        name: 'Minimal Item',
        reference: 42,
      })

      expect(typeof item.id).toBe('number')
      expect(item.id).toBeGreaterThan(0)
      expect(item.name).toBe('Minimal Item')
      expect(item.reference).toBe(42)
      expect(item.quantity).toBe(0)
      expect(item.macros.protein).toBe(0)
      expect(item.macros.carbs).toBe(0)
      expect(item.macros.fat).toBe(0)
      expect(item.__type).toBe('Item')
    })

    it('should create a valid Item with partial macros', () => {
      const item = createItem({
        name: 'Partial Macros Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          // Missing fat
        },
      })

      expect(item.name).toBe('Partial Macros Item')
      expect(item.reference).toBe(42)
      expect(item.quantity).toBe(100)
      expect(item.macros.protein).toBe(10)
      expect(item.macros.carbs).toBe(30)
      expect(item.macros.fat).toBe(0) // Default value
    })

    it('should generate unique IDs for different items', () => {
      const item1 = createItem({
        name: 'Item 1',
        reference: 42,
      })

      const item2 = createItem({
        name: 'Item 2',
        reference: 43,
      })

      expect(item1.id).not.toBe(item2.id)
      expect(typeof item1.id).toBe('number')
      expect(typeof item2.id).toBe('number')
    })

    it('should handle different item names', () => {
      const testNames = [
        'Simple Item',
        'Item with Numbers 123',
        'Item with Symbols @#$%',
        'Very Long Item Name That Contains Many Words And Characters',
        'Item with Special Characters: Açaí Berry',
        'Item with Portuguese Name: Pão de Açúcar',
        'Item with Emojis 🍎🥖',
      ]

      testNames.forEach((name) => {
        const item = createItem({
          name,
          reference: 42,
        })

        expect(item.name).toBe(name)
        expect(item.__type).toBe('Item')
      })
    })

    it('should handle different reference values', () => {
      const testReferences = [1, 42, 999, 123456, 2147483647]

      testReferences.forEach((reference) => {
        const item = createItem({
          name: 'Test Item',
          reference,
        })

        expect(item.reference).toBe(reference)
        expect(item.__type).toBe('Item')
      })
    })

    it('should handle different quantity values', () => {
      const testQuantities = [
        0, // Zero quantity
        1, // Single unit
        100, // Standard quantity
        0.5, // Half unit
        150.25, // Decimal quantity
        999.99, // Large decimal
        1000, // Large quantity
      ]

      testQuantities.forEach((quantity) => {
        const item = createItem({
          name: 'Test Item',
          reference: 42,
          quantity,
        })

        expect(item.quantity).toBe(quantity)
        expect(item.__type).toBe('Item')
      })
    })

    it('should handle different macro nutrient combinations', () => {
      const macroTestCases = [
        // Zero macros
        { protein: 0, carbs: 0, fat: 0 },
        // High protein
        { protein: 30, carbs: 5, fat: 2 },
        // High carb
        { protein: 5, carbs: 50, fat: 1 },
        // High fat
        { protein: 10, carbs: 5, fat: 25 },
        // Balanced
        { protein: 15, carbs: 30, fat: 10 },
        // Decimal values
        { protein: 12.5, carbs: 25.75, fat: 8.25 },
        // Very small values
        { protein: 0.1, carbs: 0.2, fat: 0.05 },
        // Large values
        { protein: 100, carbs: 200, fat: 50 },
      ]

      macroTestCases.forEach((macros, index) => {
        const item = createItem({
          name: `Test Item ${index + 1}`,
          reference: 42,
          quantity: 100,
          macros,
        })

        expect(item.macros.protein).toBe(macros.protein)
        expect(item.macros.carbs).toBe(macros.carbs)
        expect(item.macros.fat).toBe(macros.fat)
        expect(item.__type).toBe('Item')
      })
    })

    it('should handle empty macros object', () => {
      const item = createItem({
        name: 'Empty Macros Item',
        reference: 42,
        quantity: 100,
        macros: {},
      })

      expect(item.macros.protein).toBe(0)
      expect(item.macros.carbs).toBe(0)
      expect(item.macros.fat).toBe(0)
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle very long item names', () => {
      const longName = 'A'.repeat(1000)
      const item = createItem({
        name: longName,
        reference: 42,
      })

      expect(item.name).toBe(longName)
      expect(item.name.length).toBe(1000)
    })

    it('should handle extreme quantity values', () => {
      const extremeQuantities = [
        0.001, // Very small
        0.1, // Small decimal
        999999.999, // Large decimal
        Number.MAX_SAFE_INTEGER, // Maximum safe integer
      ]

      extremeQuantities.forEach((quantity) => {
        const item = createItem({
          name: 'Extreme Quantity Item',
          reference: 42,
          quantity,
        })

        expect(item.quantity).toBe(quantity)
      })
    })

    it('should handle extreme reference values', () => {
      const extremeReferences = [
        1, // Minimum positive
        Number.MAX_SAFE_INTEGER, // Maximum safe integer
        2147483647, // 32-bit signed integer max
      ]

      extremeReferences.forEach((reference) => {
        const item = createItem({
          name: 'Extreme Reference Item',
          reference,
        })

        expect(item.reference).toBe(reference)
      })
    })

    it('should handle extreme macro values', () => {
      const extremeMacros = [
        { protein: 0.001, carbs: 0.001, fat: 0.001 },
        { protein: 999.999, carbs: 999.999, fat: 999.999 },
        { protein: Number.MAX_SAFE_INTEGER, carbs: 0, fat: 0 },
      ]

      extremeMacros.forEach((macros, index) => {
        const item = createItem({
          name: `Extreme Macros Item ${index + 1}`,
          reference: 42,
          quantity: 100,
          macros,
        })

        expect(item.macros.protein).toBe(macros.protein)
        expect(item.macros.carbs).toBe(macros.carbs)
        expect(item.macros.fat).toBe(macros.fat)
      })
    })

    it('should handle high precision decimal values', () => {
      const preciseValues = {
        quantity: 100.123456789,
        macros: createMacroNutrients({
          protein: 10,
          carbs: 30,
          fat: 5,
        }),
      }

      const item = createItem({
        name: 'High Precision Item',
        reference: 42,
        quantity: preciseValues.quantity,
        macros: preciseValues.macros,
      })

      expect(item.quantity).toBe(preciseValues.quantity)
      expect(item.macros.protein).toBe(preciseValues.macros.protein)
      expect(item.macros.carbs).toBe(preciseValues.macros.carbs)
      expect(item.macros.fat).toBe(preciseValues.macros.fat)
    })
  })

  describe('Legacy compatibility', () => {
    it('should maintain backward compatibility with existing data', () => {
      // Simulating legacy data that might exist in the database
      const legacyData = {
        id: 1,
        name: 'Legacy Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
        __type: 'Item',
        // Legacy fields that should be ignored
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }

      const result = itemSchema.safeParse(legacyData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Legacy Item')
        expect(result.data.reference).toBe(42)
        expect(result.data.quantity).toBe(100)
        expect('created_at' in result.data).toBe(false)
        expect('updated_at' in result.data).toBe(false)
      }
    })

    it('should handle legacy data without __type field', () => {
      const legacyDataWithoutType = {
        id: 1,
        name: 'Legacy Item Without Type',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
      }

      const result = itemSchema.safeParse(legacyDataWithoutType)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.__type).toBe('Item')
      }
    })

    it('should handle legacy data with incorrect __type', () => {
      const legacyDataWithIncorrectType = {
        id: 1,
        name: 'Legacy Item With Incorrect Type',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
        __type: 'OldItem', // This should be transformed to 'Item'
      }

      const result = itemSchema.safeParse(legacyDataWithIncorrectType)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.__type).toBe('Item')
      }
    })
  })

  describe('Business rules and validation', () => {
    it('should validate item reference consistency', () => {
      // Items with the same reference should be referencing the same food/recipe
      const items = [
        createItem({ name: 'Banana Item 1', reference: 42, quantity: 100 }),
        createItem({ name: 'Banana Item 2', reference: 42, quantity: 150 }),
        createItem({ name: 'Apple Item', reference: 43, quantity: 200 }),
      ]

      expect(items[0]?.reference).toBe(items[1]?.reference)
      expect(items[0]?.reference).not.toBe(items[2]?.reference)
    })

    it('should validate item naming conventions', () => {
      const validNames = [
        'Simple Item',
        'Item With Multiple Words',
        'Item123',
        'Item-with-dashes',
        'Item_with_underscores',
        'Item with (parentheses)',
        'Item with [brackets]',
        'Item with {braces}',
        'Item with special chars: @#$%',
      ]

      validNames.forEach((name) => {
        const item = createItem({
          name,
          reference: 42,
        })

        expect(item.name).toBe(name)
        expect(item.__type).toBe('Item')
      })
    })
  })

  describe('Schema compatibility', () => {
    it('should be compatible with JSON serialization/deserialization', () => {
      const item = createItem({
        name: 'JSON Test Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
      })

      // Serialize to JSON and back
      const jsonString = JSON.stringify(item)
      // eslint-disable-next-line no-restricted-syntax
      const parsedItem = JSON.parse(jsonString)

      // Validate the parsed item
      const result = itemSchema.safeParse(parsedItem)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe(item.name)
        expect(result.data.reference).toBe(item.reference)
        expect(result.data.quantity).toBe(item.quantity)
        expect(result.data.macros.protein).toBe(item.macros.protein)
      }
    })

    it('should be compatible with database row format', () => {
      const dbRow = {
        id: 1,
        name: 'Database Item',
        reference: 42,
        quantity: 100,
        macros: {
          protein: 10,
          carbs: 30,
          fat: 5,
          __type: 'MacroNutrients',
        },
        __type: 'Item',
        // Extra database fields
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_id: 999,
      }

      const result = itemSchema.safeParse(dbRow)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Database Item')
        expect(result.data.reference).toBe(42)
        expect(result.data.quantity).toBe(100)
        // Extra fields should be stripped
        expect('created_at' in result.data).toBe(false)
        expect('updated_at' in result.data).toBe(false)
        expect('user_id' in result.data).toBe(false)
      }
    })
  })
})
