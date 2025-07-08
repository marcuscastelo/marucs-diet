/* eslint-disable no-restricted-syntax */

/**
 * Shared validation message utilities for Portuguese error messages.
 * Centralizes common validation patterns to reduce duplication across domain schemas.
 */

import { z } from 'zod/v4'
import { type util } from 'zod/v4/core'

import { parseWithStack } from '~/shared/utils/parseWithStack'

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
 * Uses iss.path to automatically detect the field name from Zod's validation context.
 */
function createFieldValidationMessages(
  typeDescription: string,
  entityName: string,
  validErrorCode: 'invalid_type' | 'invalid_value' = 'invalid_type',
): z.core.TypeParams<z.ZodType> {
  return {
    error: (iss) => {
      switch (iss.code) {
        case validErrorCode: {
          // Use iss.path to get the field name automatically
          const fieldName =
            iss.path && iss.path.length > 0 ? iss.path.join('.') : 'campo'
          return createInvalidTypeMessage(
            fieldName,
            entityName,
            typeDescription,
          )
        }
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
export function createZodEntity<TEntity extends keyof typeof ENTITY_NAMES>(
  entityKey: TEntity,
) {
  const entityName = ENTITY_NAMES[entityKey]

  return {
    /**
     * Creates a Zod number field with Portuguese validation messages.
     */
    number: (): z.ZodNumber =>
      z.number(
        createFieldValidationMessages(TYPE_DESCRIPTIONS.number, entityName),
      ),

    /**
     * Creates a Zod string field with Portuguese validation messages.
     */
    string: (): z.ZodString =>
      z.string(
        createFieldValidationMessages(TYPE_DESCRIPTIONS.string, entityName),
      ),

    /**
     * Creates a Zod date field with Portuguese validation messages.
     */
    date: (): z.ZodDate =>
      z.date(createFieldValidationMessages(TYPE_DESCRIPTIONS.date, entityName)),

    /**
     * Creates a Zod enum field with Portuguese validation messages.
     */
    enum: <T extends util.EnumLike = util.EnumLike>(values: T): z.ZodEnum<T> =>
      z.enum(
        values,
        createFieldValidationMessages(
          TYPE_DESCRIPTIONS.enum,
          entityName,
          'invalid_value',
        ),
      ),

    /**
     * Creates a Zod array field with Portuguese validation messages.
     */
    array: <T extends z.ZodTypeAny>(elementType: T): z.ZodArray<T> =>
      z.array(
        elementType,
        createFieldValidationMessages(TYPE_DESCRIPTIONS.array, entityName),
      ),

    /**
     * Creates a generic Zod object schema using the current entity context.
     */
    create: <TShape extends z.ZodRawShape>(shape: TShape) => {
      const hasId = 'id' in shape

      let schema, newSchema, brandedSchema, brandedNewSchema
      if (hasId) {
        schema = z.object(shape)
        newSchema = z.object(shape).omit({ id: true })
        brandedSchema = schema.brand<TEntity>(entityKey)
        brandedNewSchema = newSchema.brand<`New${TEntity}`>(`New${entityKey}`)
      } else {
        schema = z.object(shape)
        newSchema = z.object(shape)
        brandedSchema = schema.brand<TEntity>(entityKey)
        brandedNewSchema = newSchema.brand<TEntity>(entityKey)
      }

      type NewSchema = z.infer<typeof newSchema>
      type BrandedNewSchema = z.infer<typeof brandedNewSchema>
      type BrandedSchema = z.infer<typeof brandedSchema>

      const createNew = (data: NewSchema): BrandedNewSchema =>
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        brandedNewSchema.parse(
          parseWithStack(newSchema, data),
        ) as BrandedNewSchema

      const promote = (data: BrandedNewSchema, id: number): BrandedSchema =>
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        brandedSchema.parse(
          parseWithStack(schema, {
            ...data,
            id,
          }),
        ) as BrandedSchema

      const demote = (data: BrandedSchema): BrandedNewSchema =>
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        newSchema.parse(
          parseWithStack(brandedNewSchema, data),
        ) as BrandedNewSchema

      return {
        schema: brandedSchema,
        newSchema: brandedNewSchema,
        unbranded: {
          schema,
          newSchema,
        },
        createNew,
        promote,
        demote,
      }
    },
  }
}
