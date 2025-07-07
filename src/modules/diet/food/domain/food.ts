import { z } from 'zod'

import {
  FoodInvalidEanError,
  FoodInvalidMacrosError,
  FoodInvalidNameError,
  FoodNegativeMacrosError,
} from '~/modules/diet/food/domain/foodErrors'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createNewTypeField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createMacroNutrientsField } from '~/shared/domain/schema/macroNutrientsBaseSchema'
import {
  createNullableStringField,
  createStringField,
} from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const foodSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createStringField('name'),
    description: createDescriptionField(),
    macros: createMacroNutrientsField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
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
  .strip()

export const newFoodSchema = foodSchema
  .omit({ id: true })
  .extend({
    __type: createNewTypeField('NewFood'),
  })
  .strip()

export type NewFood = Readonly<z.infer<typeof newFoodSchema>>
export type Food = Readonly<z.infer<typeof foodSchema>>

/**
 * Creates a new NewFood.
 * Used for initializing new foods before saving to database.
 */
export function createNewFood({
  userId,
  name,
  description = null,
  macros,
  ean,
  source,
}: {
  userId: number
  name: string
  description?: string | null
  macros: MacroNutrients
  ean: string | null
  source?: NewFood['source']
}): NewFood {
  return {
    userId,
    name,
    description,
    macros,
    createdAt: new Date(),
    updatedAt: new Date(),
    ean,
    source,
    __type: 'new-NewFood' as const,
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
    userId: food.userId,
    name: food.name,
    description: food.description,
    macros: food.macros,
    createdAt: food.createdAt,
    updatedAt: food.updatedAt,
    ean: food.ean,
    source: food.source,
    __type: 'new-NewFood',
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
  userId,
  name,
  description,
  macros,
  ean,
  source,
}: {
  userId: number
  name: string
  description?: string | null
  macros: MacroNutrients
  ean: string | null
  source?: NewFood['source']
}): NewFood {
  validateFoodName(name)
  validateFoodMacros(macros)
  validateFoodEan(ean)

  return createNewFood({ userId, name, description, macros, ean, source })
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
