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
 * Generic functions to create field validation message handlers.
 * Generates consistent Portuguese error messages for all field types.
 */

/**
 * Creates number field validation messages.
 */
export function createNumberFieldMessages(
  fieldName: string,
): (entityName: keyof typeof ENTITY_NAMES) => z.core.$ZodNumberParams {
  return (entityName: keyof typeof ENTITY_NAMES): z.core.$ZodNumberParams => ({
    error: (iss) => {
      iss.code satisfies 'invalid_type'
      return createInvalidTypeMessage(
        fieldName,
        ENTITY_NAMES[entityName],
        TYPE_DESCRIPTIONS.number,
      )
    },
  })
}

/**
 * Creates string field validation messages.
 */
export function createStringFieldMessages(
  fieldName: string,
): (entityName: keyof typeof ENTITY_NAMES) => z.core.$ZodStringParams {
  return (entityName: keyof typeof ENTITY_NAMES): z.core.$ZodStringParams => ({
    error: (iss) => {
      iss.code satisfies 'invalid_type'
      return createInvalidTypeMessage(
        fieldName,
        ENTITY_NAMES[entityName],
        TYPE_DESCRIPTIONS.string,
      )
    },
  })
}

/**
 * Creates date field validation messages.
 */
export function createDateFieldMessages(
  fieldName: string,
): (entityName: keyof typeof ENTITY_NAMES) => z.core.$ZodDateParams {
  return (entityName: keyof typeof ENTITY_NAMES): z.core.$ZodDateParams => ({
    error: (iss) => {
      iss.code satisfies 'invalid_type'
      return createInvalidTypeMessage(
        fieldName,
        ENTITY_NAMES[entityName],
        TYPE_DESCRIPTIONS.date,
      )
    },
  })
}

/**
 * Creates enum field validation messages.
 */
export function createEnumFieldMessages(
  fieldName: string,
): (entityName: keyof typeof ENTITY_NAMES) => z.core.$ZodEnumParams {
  return (entityName: keyof typeof ENTITY_NAMES): z.core.$ZodEnumParams => ({
    error: (iss) => {
      iss.code satisfies 'invalid_value'
      return createInvalidTypeMessage(
        fieldName,
        ENTITY_NAMES[entityName],
        'um valor válido',
      )
    },
  })
}

/**
 * Creates array field validation messages.
 */
export function createArrayFieldMessages(
  fieldName: string,
): (entityName: keyof typeof ENTITY_NAMES) => z.core.$ZodArrayParams {
  return (entityName: keyof typeof ENTITY_NAMES): z.core.$ZodArrayParams => ({
    error: (iss) => {
      iss.code satisfies 'invalid_type'
      return createInvalidTypeMessage(
        fieldName,
        ENTITY_NAMES[entityName],
        TYPE_DESCRIPTIONS.array,
      )
    },
  })
}
