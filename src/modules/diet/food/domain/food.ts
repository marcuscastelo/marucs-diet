import { z } from 'zod/v4'

import {
  FoodInvalidEanError,
  FoodInvalidMacrosError,
  FoodInvalidNameError,
  FoodNegativeMacrosError,
} from '~/modules/diet/food/domain/foodErrors'
import {
  type MacroNutrients,
  macroNutrientsSchema,
} from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createNumberFieldMessages,
  createStringFieldMessages,
} from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const newFoodSchema = z.object({
  name: z.string(createStringFieldMessages('name')('food')),
  ean: z.string(createStringFieldMessages('ean')('food')).nullable(),
  macros: macroNutrientsSchema,
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(createStringFieldMessages('sourceId')('food')),
    })
    .optional(),
  __type: z.literal('NewFood'),
})

export const foodSchema = z.object({
  id: z.number(createNumberFieldMessages('id')('food')),
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(createStringFieldMessages('sourceId')('food')),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  name: z.string(createStringFieldMessages('name')('food')),
  ean: z.string(createStringFieldMessages('ean')('food')).nullable(),
  macros: macroNutrientsSchema,
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Food' as const),
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
