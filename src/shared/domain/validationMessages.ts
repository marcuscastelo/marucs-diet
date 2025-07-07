/**
 * Shared validation message utilities for Portuguese error messages.
 * Centralizes common validation patterns to reduce duplication across domain schemas.
 */

import { z } from 'zod/v4'
import { type util } from 'zod/v4/core'

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
  enum: 'enum',
} as const

/**
 * Generic functions to create field validation message handlers.
 * Generates consistent Portuguese error messages for all field types.
 */

/**
 * Generic function to create field validation messages with error handling.
 * This function provides consistent error handling patterns for all field types.
 */
function createFieldValidationMessages(
  fieldName: string,
  typeDescription: string,
  entityName: string,
  validErrorCode: 'invalid_type' | 'invalid_value' = 'invalid_type',
): z.core.TypeParams<z.ZodType> {
  return {
    error: (iss) => {
      switch (iss.code) {
        case validErrorCode:
          return createInvalidTypeMessage(
            fieldName,
            entityName,
            typeDescription,
          )
        default:
          break
      }
    },
  }
}

/**
 * Zod entity factory that creates field validators for a specific entity.
 * Returns an object with methods for each field type (number, string, date, etc.).
 */
export function createZodEntity(entityKey: keyof typeof ENTITY_NAMES) {
  const entityName = ENTITY_NAMES[entityKey]

  return {
    /**
     * Creates a Zod number field with Portuguese validation messages.
     */
    number: (fieldName: string): z.ZodNumber =>
      z.number(
        createFieldValidationMessages(
          fieldName,
          TYPE_DESCRIPTIONS.number,
          entityName,
        ),
      ),

    /**
     * Creates a Zod string field with Portuguese validation messages.
     */
    string: (fieldName: string): z.ZodString =>
      z.string(
        createFieldValidationMessages(
          fieldName,
          TYPE_DESCRIPTIONS.string,
          entityName,
        ),
      ),

    /**
     * Creates a Zod date field with Portuguese validation messages.
     */
    date: (fieldName: string): z.ZodDate =>
      z.date(
        createFieldValidationMessages(
          fieldName,
          TYPE_DESCRIPTIONS.date,
          entityName,
        ),
      ),

    /**
     * Creates a Zod enum field with Portuguese validation messages.
     */
    enum: <T extends util.EnumLike = util.EnumLike>(
      fieldName: string,
      values: T,
    ): z.ZodEnum<T> =>
      z.enum(
        values,
        createFieldValidationMessages(
          fieldName,
          TYPE_DESCRIPTIONS.enum,
          entityName,
        ),
      ),

    /**
     * Creates a Zod array field with Portuguese validation messages.
     */
    array: <T extends z.ZodTypeAny>(
      fieldName: string,
      elementType: T,
    ): z.ZodArray<T> =>
      z.array(
        elementType,
        createFieldValidationMessages(
          fieldName,
          TYPE_DESCRIPTIONS.array,
          entityName,
        ),
      ),

    /**
     * Creates a generic Zod object schema using the current entity context.
     */
    create: <T extends z.ZodRawShape>(shape: T): z.ZodObject<T> =>
      z.object(shape),
  }
}
