import { z } from 'zod'

import {
  FoodInvalidEanError,
  FoodInvalidMacrosError,
  FoodInvalidNameError,
  FoodNegativeMacrosError,
} from '~/modules/diet/food/domain/foodErrors'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createNewTypeField,
  createTypeField,
  entityBaseSchema,
  namedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { macroNutrientsBaseSchema } from '~/shared/domain/schema/macroNutrientsBaseSchema'
import { createNullableStringField } from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const newFoodSchema = namedEntityBaseSchema
  .merge(macroNutrientsBaseSchema)
  .extend({
    ean: createNullableStringField('ean'),
    source: z
      .object({
        type: z.literal('api'),
        id: z.string({
          required_error: "O campo 'id' da fonte do alimento é obrigatório.",
          invalid_type_error:
            "O campo 'id' da fonte do alimento deve ser uma string.",
        }),
      })
      .optional(),
    __type: createNewTypeField('NewFood'),
  })

export const foodSchema = entityBaseSchema
  .merge(namedEntityBaseSchema)
  .merge(macroNutrientsBaseSchema)
  .extend({
    source: z
      .object({
        type: z.literal('api'),
        id: z.string({
          required_error: "O campo 'id' da fonte do alimento é obrigatório.",
          invalid_type_error:
            "O campo 'id' da fonte do alimento deve ser uma string.",
        }),
      })
      .nullable()
      .transform((val) => val ?? undefined)
      .optional(),
    ean: createNullableStringField('ean'),
    __type: createTypeField('Food'),
  })

export type NewFood = Readonly<z.infer<typeof newFoodSchema>>
export type Food = Readonly<z.infer<typeof foodSchema>>

/**
 * Creates a new NewFood.
 * Used for initializing new foods before saving to database.
 */
export function createNewFood({
  name,
  macros,
  ean,
  source,
}: {
  name: string
  macros: MacroNutrients
  ean: string | null
  source?: NewFood['source']
}): NewFood {
  return {
    name,
    macros,
    ean,
    source,
    __type: 'NewFood',
  }
}

/**
 * Promotes a NewFood to a Food after persistence.
 */
export function promoteToFood(newFood: NewFood, id: number): Food {
  return {
    ...newFood,
    id,
    __type: 'Food',
  }
}

/**
 * Demotes a Food to a NewFood for updates.
 * Used when converting a persisted Food back to NewFood for database operations.
 */
export function demoteToNewFood(food: Food): NewFood {
  return parseWithStack(newFoodSchema, {
    name: food.name,
    macros: food.macros,
    ean: food.ean,
    source: food.source,
    __type: 'NewFood',
  })
}

/**
 * Validates food name according to business rules
 */
export function validateFoodName(name: string): void {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new FoodInvalidNameError(name)
  }
}

/**
 * Validates food macro nutrients according to business rules
 */
export function validateFoodMacros(macros: MacroNutrients): void {
  if (
    typeof macros.carbs !== 'number' ||
    typeof macros.protein !== 'number' ||
    typeof macros.fat !== 'number'
  ) {
    throw new FoodInvalidMacrosError(macros)
  }

  if (macros.carbs < 0 || macros.protein < 0 || macros.fat < 0) {
    throw new FoodNegativeMacrosError(macros)
  }
}

/**
 * Validates food EAN code format
 */
export function validateFoodEan(ean: string | null): void {
  if (ean !== null && (typeof ean !== 'string' || ean.trim().length === 0)) {
    throw new FoodInvalidEanError(ean)
  }
}

/**
 * Creates a new NewFood with validation.
 */
export function createNewFoodWithValidation({
  name,
  macros,
  ean,
  source,
}: {
  name: string
  macros: MacroNutrients
  ean: string | null
  source?: NewFood['source']
}): NewFood {
  validateFoodName(name)
  validateFoodMacros(macros)
  validateFoodEan(ean)

  return createNewFood({ name, macros, ean, source })
}

/**
 * Promotes a NewFood to a Food after persistence with validation.
 */
export function promoteToFoodWithValidation(
  newFood: NewFood,
  id: number,
): Food {
  const food = promoteToFood(newFood, id)

  // Additional validation can be performed here if needed

  return food
}

/**
 * Demotes a Food to a NewFood for updates with validation.
 */
export function demoteToNewFoodWithValidation(food: Food): NewFood {
  const newFood = demoteToNewFood(food)

  // Additional validation can be performed here if needed

  return newFood
}
