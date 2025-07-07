/**
 * Shared validation message utilities for Portuguese error messages.
 * Centralizes common validation patterns to reduce duplication across domain schemas.
 */

import { type z } from 'zod/v4'

/**
 * Generates required field error message in Portuguese.
 */
export function createRequiredFieldMessage(
  fieldName: string,
  entityName: string,
): string {
  return `O campo '${fieldName}' ${entityName} é obrigatório.`
}

/**
 * Generates invalid type error message in Portuguese.
 */
export function createInvalidTypeMessage(
  fieldName: string,
  entityName: string,
  expectedType: string,
): string {
  return `O campo '${fieldName}' ${entityName} deve ser ${expectedType}.`
}

/**
 * Common entity name mappings for consistent Portuguese messages.
 */
export const ENTITY_NAMES = {
  food: 'do alimento',
  recipe: 'da receita',
  user: 'do usuário',
  weight: 'do peso',
  measure: 'da medida corporal',
  dayDiet: 'da dieta do dia',
  macroProfile: 'do perfil de macros',
  itemGroup: 'do grupo de itens',
  item: 'do item',
  recipeItem: 'do item de receita',
  meal: 'da refeição',
  macroNutrients: 'dos macronutrientes',
} as const

/**
 * Common type descriptions for validation messages.
 */
export const TYPE_DESCRIPTIONS = {
  number: 'um número',
  string: 'uma string',
  date: 'uma data ou string',
  boolean: 'um booleano',
  array: 'uma lista',
  arrayOfNumbers: 'uma lista de números',
} as const

/**
 * Pre-built message generators for common field patterns.
 */
export const FIELD_MESSAGES = {
  id: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
    // required_error: createRequiredFieldMessage('id', ENTITY_NAMES[entityName]),
    // invalid_type_error: createInvalidTypeMessage(
    //   'id',
    //   ENTITY_NAMES[entityName],
    //   TYPE_DESCRIPTIONS.number,
    // ),
  }),

  name: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodStringParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
    // required_error: createRequiredFieldMessage(
    //   'name',
    //   ENTITY_NAMES[entityName],
    // ),
    // invalid_type_error: createInvalidTypeMessage(
    //   'name',
    //   ENTITY_NAMES[entityName],
    //   TYPE_DESCRIPTIONS.string,
    // ),
  }),

  owner: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
    // required_error: createRequiredFieldMessage(
    //   'owner',
    //   ENTITY_NAMES[entityName],
    // ),
    // invalid_type_error: createInvalidTypeMessage(
    //   'owner',
    //   ENTITY_NAMES[entityName],
    //   TYPE_DESCRIPTIONS.number,
    // ),
  }),

  targetTimestamp: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodDateParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
    // required_error: createRequiredFieldMessage(
    //   'target_timestamp',
    //   ENTITY_NAMES[entityName],
    // ),
    // invalid_type_error: createInvalidTypeMessage(
    //   'target_timestamp',
    //   ENTITY_NAMES[entityName],
    //   TYPE_DESCRIPTIONS.date,
    // ),
  }),

  weight: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
    // required_error: createRequiredFieldMessage(
    //   'weight',
    //   ENTITY_NAMES[entityName],
    // ),
    // invalid_type_error: createInvalidTypeMessage(
    //   'weight',
    //   ENTITY_NAMES[entityName],
    //   TYPE_DESCRIPTIONS.number,
    // ),
  }),

  desiredWeight: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  birthdate: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodStringParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  diet: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodEnumParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  favoriteFoods: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  height: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  waist: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  hip: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  neck: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  ean: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodStringParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  sourceId: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodStringParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  preparedMultiplier: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  recipe: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  reference: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  quantity: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  gramsPerKgCarbs: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  gramsPerKgProtein: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  gramsPerKgFat: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),

  targetDay: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodDateParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
  carbs: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
  protein: (
    _entityName: keyof typeof ENTITY_NAMES,
  ): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
  fat: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
  items: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodArrayParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
  meals: (_entityName: keyof typeof ENTITY_NAMES): z.core.$ZodArrayParams => ({
    error: (_iss) => {
      return 'Error message: TODO'
    },
  }),
} as const
