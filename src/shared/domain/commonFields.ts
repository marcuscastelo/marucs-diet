import { z } from 'zod/v4'

import {
  createArrayFieldMessages,
  createDateFieldMessages,
  createEnumFieldMessages,
  createNumberFieldMessages,
  createStringFieldMessages,
  type ENTITY_NAMES,
} from '~/shared/domain/validationMessages'

/**
 * Common field definitions that can be reused across domain schemas.
 * These utilities help reduce duplication while preserving the existing
 * newSchema.extend(schema) pattern.
 */

/**
 * Creates a standard ID field with consistent validation.
 */
export function createIdField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('id')(entityName))
}

/**
 * Creates a standard name field with consistent validation.
 */
export function createNameField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(createStringFieldMessages('name')(entityName))
}

/**
 * Creates a standard owner field with consistent validation.
 */
export function createOwnerField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('owner')(entityName))
}

/**
 * Creates a standard weight field with consistent validation.
 */
export function createWeightField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('weight')(entityName))
}

/**
 * Creates a standard target_timestamp field with date/string transformation.
 */
export function createTargetTimestampField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  const messages = createDateFieldMessages('target_timestamp')(entityName)
  return z
    .date(messages)
    .or(z.string(createStringFieldMessages('target_timestamp')(entityName)))
    .transform((v) => new Date(v))
}

/**
 * Creates a standard __type field for NewEntity schemas.
 */
export function createNewTypeField<T extends string>(typeLiteral: T) {
  return z.literal(typeLiteral)
}

/**
 * Creates a standard __type field for Entity schemas with transformation.
 */
export function createTypeField<T extends string>(typeLiteral: T) {
  return z
    .string()
    .nullable()
    .optional()
    .transform(() => typeLiteral)
}

/**
 * Creates a desired_weight field with consistent validation.
 */
export function createDesiredWeightField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z.number(createNumberFieldMessages('desired_weight')(entityName))
}

/**
 * Creates a birthdate field with consistent validation.
 */
export function createBirthdateField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(createStringFieldMessages('birthdate')(entityName))
}

/**
 * Creates a diet enum field with consistent validation.
 */
export function createDietField(entityName: keyof typeof ENTITY_NAMES) {
  return z.enum(
    ['cut', 'normo', 'bulk'],
    createEnumFieldMessages('diet')(entityName),
  )
}

/**
 * Creates a favorite_foods array field with consistent validation.
 */
export function createFavoriteFoodsField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z
    .array(z.number(createNumberFieldMessages('favorite_foods')(entityName)))
    .nullable()
    .transform((value) => value ?? [])
}

/**
 * Creates measure-specific fields with consistent validation.
 */
export function createHeightField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('height')(entityName))
}

export function createWaistField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('waist')(entityName))
}

export function createHipField(entityName: keyof typeof ENTITY_NAMES) {
  return z
    .number(createNumberFieldMessages('hip')(entityName))
    .nullish()
    .transform((v) => (v === null ? undefined : v))
}

export function createNeckField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('neck')(entityName))
}

/**
 * Creates an EAN field with consistent validation.
 */
export function createEanField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(createStringFieldMessages('ean')(entityName)).nullable()
}

/**
 * Creates a source field for food schemas.
 */
export function createFoodSourceField(entityName: keyof typeof ENTITY_NAMES) {
  return z
    .object({
      type: z.literal('api'),
      id: z.string(createStringFieldMessages('source_id')(entityName)),
    })
    .optional()
}

/**
 * Creates a source field for persisted food schemas with transformation.
 */
export function createPersistedFoodSourceField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z
    .object({
      type: z.literal('api'),
      id: z.string(createStringFieldMessages('source_id')(entityName)),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional()
}

/**
 * Creates a prepared_multiplier field for recipe schemas with consistent validation.
 */
export function createPreparedMultiplierField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z
    .number(createNumberFieldMessages('prepared_multiplier')(entityName))
    .default(1)
}

/**
 * Creates a recipe field with consistent validation.
 */
export function createRecipeField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('recipe')(entityName))
}

/**
 * Creates a reference field with consistent validation.
 */
export function createReferenceField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('reference')(entityName))
}

/**
 * Creates a quantity field with consistent validation.
 */
export function createQuantityField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('quantity')(entityName))
}

/**
 * Creates macro profile specific fields with consistent validation.
 */
export function createGramsPerKgCarbsField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z.number(createNumberFieldMessages('gramsPerKgCarbs')(entityName))
}

export function createGramsPerKgProteinField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z.number(createNumberFieldMessages('gramsPerKgProtein')(entityName))
}

export function createGramsPerKgFatField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z.number(createNumberFieldMessages('gramsPerKgFat')(entityName))
}

/**
 * Creates a target_day field with date/string transformation for macro profiles.
 */
export function createTargetDayField(entityName: keyof typeof ENTITY_NAMES) {
  const messages = createDateFieldMessages('target_day')(entityName)
  return z
    .date(messages)
    .or(z.string(createStringFieldMessages('target_day')(entityName)))
    .transform((v) => new Date(v))
}

/**
 * Creates macro nutrient fields with consistent validation.
 */
export function createCarbsField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('carbs')(entityName))
}

export function createProteinField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('protein')(entityName))
}

export function createFatField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(createNumberFieldMessages('fat')(entityName))
}

/**
 * Creates items array field with consistent validation.
 */
export function createItemsField<T>(
  entityName: keyof typeof ENTITY_NAMES,
  itemSchema: z.ZodType<T>,
) {
  return z.array(itemSchema, createArrayFieldMessages('items')(entityName))
}

/**
 * Creates meals array field with consistent validation.
 */
export function createMealsField<T>(
  entityName: keyof typeof ENTITY_NAMES,
  mealSchema: z.ZodType<T>,
) {
  return z.array(mealSchema, createArrayFieldMessages('meals')(entityName))
}
