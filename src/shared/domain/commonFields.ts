import { z } from 'zod/v4'

import {
  type ENTITY_NAMES,
  FIELD_MESSAGES,
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
  return z.number(FIELD_MESSAGES.id(entityName))
}

/**
 * Creates a standard name field with consistent validation.
 */
export function createNameField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(FIELD_MESSAGES.name(entityName))
}

/**
 * Creates a standard owner field with consistent validation.
 */
export function createOwnerField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.owner(entityName))
}

/**
 * Creates a standard weight field with consistent validation.
 */
export function createWeightField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.weight(entityName))
}

/**
 * Creates a standard target_timestamp field with date/string transformation.
 */
export function createTargetTimestampField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  const messages = FIELD_MESSAGES.targetTimestamp(entityName)
  return z
    .date(messages)
    .or(z.string(messages))
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
  return z.number(FIELD_MESSAGES.desiredWeight(entityName))
}

/**
 * Creates a birthdate field with consistent validation.
 */
export function createBirthdateField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(FIELD_MESSAGES.birthdate(entityName))
}

/**
 * Creates a diet enum field with consistent validation.
 */
export function createDietField(entityName: keyof typeof ENTITY_NAMES) {
  return z.enum(['cut', 'normo', 'bulk'], FIELD_MESSAGES.diet(entityName))
}

/**
 * Creates a favorite_foods array field with consistent validation.
 */
export function createFavoriteFoodsField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  return z
    .array(z.number(FIELD_MESSAGES.favoriteFoods(entityName)))
    .nullable()
    .transform((value) => value ?? [])
}

/**
 * Creates measure-specific fields with consistent validation.
 */
export function createHeightField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.height(entityName))
}

export function createWaistField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.waist(entityName))
}

export function createHipField(entityName: keyof typeof ENTITY_NAMES) {
  return z
    .number(FIELD_MESSAGES.hip(entityName))
    .nullish()
    .transform((v) => (v === null ? undefined : v))
}

export function createNeckField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.neck(entityName))
}

/**
 * Creates an EAN field with consistent validation.
 */
export function createEanField(entityName: keyof typeof ENTITY_NAMES) {
  return z.string(FIELD_MESSAGES.ean(entityName)).nullable()
}

/**
 * Creates a source field for food schemas.
 */
export function createFoodSourceField(entityName: keyof typeof ENTITY_NAMES) {
  return z
    .object({
      type: z.literal('api'),
      id: z.string(FIELD_MESSAGES.sourceId(entityName)),
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
      id: z.string(FIELD_MESSAGES.sourceId(entityName)),
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
  return z.number(FIELD_MESSAGES.preparedMultiplier(entityName)).default(1)
}

/**
 * Creates a recipe field with consistent validation.
 */
export function createRecipeField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.recipe(entityName))
}

/**
 * Creates a reference field with consistent validation.
 */
export function createReferenceField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.reference(entityName))
}

/**
 * Creates a quantity field with consistent validation.
 */
export function createQuantityField(entityName: keyof typeof ENTITY_NAMES) {
  return z.number(FIELD_MESSAGES.quantity(entityName))
}
