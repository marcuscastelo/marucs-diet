import { z } from 'zod'

import {
  ENTITY_NAMES,
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
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'desired_weight' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'desired_weight' ${ENTITY_NAMES[entityName]} deve ser um número.`,
  }
  return z.number({ required_error, invalid_type_error })
}

/**
 * Creates a birthdate field with consistent validation.
 */
export function createBirthdateField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'birthdate' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'birthdate' ${ENTITY_NAMES[entityName]} deve ser uma string.`,
  }
  return z.string({ required_error, invalid_type_error })
}

/**
 * Creates a diet enum field with consistent validation.
 */
export function createDietField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'diet' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'diet' ${ENTITY_NAMES[entityName]} deve ser 'cut', 'normo' ou 'bulk'.`,
  }
  return z.enum(['cut', 'normo', 'bulk'], {
    required_error,
    invalid_type_error,
  })
}

/**
 * Creates a favorite_foods array field with consistent validation.
 */
export function createFavoriteFoodsField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'favorite_foods' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'favorite_foods' deve ser uma lista de números.`,
  }
  return z
    .array(z.number({ required_error, invalid_type_error }))
    .nullable()
    .transform((value) => value ?? [])
}

/**
 * Creates measure-specific fields with consistent validation.
 */
export function createHeightField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'height' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'height' ${ENTITY_NAMES[entityName]} deve ser um número.`,
  }
  return z.number({ required_error, invalid_type_error })
}

export function createWaistField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'waist' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'waist' ${ENTITY_NAMES[entityName]} deve ser um número.`,
  }
  return z.number({ required_error, invalid_type_error })
}

export function createHipField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'hip' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'hip' ${ENTITY_NAMES[entityName]} deve ser um número.`,
  }
  return z
    .number({ required_error, invalid_type_error })
    .nullish()
    .transform((v) => (v === null ? undefined : v))
}

export function createNeckField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'neck' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'neck' ${ENTITY_NAMES[entityName]} deve ser um número.`,
  }
  return z.number({ required_error, invalid_type_error })
}

/**
 * Creates an EAN field with consistent validation.
 */
export function createEanField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'ean' ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'ean' ${ENTITY_NAMES[entityName]} deve ser uma string.`,
  }
  return z.string({ required_error, invalid_type_error }).nullable()
}

/**
 * Creates a source field for food schemas.
 */
export function createFoodSourceField(entityName: keyof typeof ENTITY_NAMES) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'id' da fonte ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'id' da fonte ${ENTITY_NAMES[entityName]} deve ser uma string.`,
  }

  return z
    .object({
      type: z.literal('api'),
      id: z.string({ required_error, invalid_type_error }),
    })
    .optional()
}

/**
 * Creates a source field for persisted food schemas with transformation.
 */
export function createPersistedFoodSourceField(
  entityName: keyof typeof ENTITY_NAMES,
) {
  const { required_error, invalid_type_error } = {
    required_error: `O campo 'id' da fonte ${ENTITY_NAMES[entityName]} é obrigatório.`,
    invalid_type_error: `O campo 'id' da fonte ${ENTITY_NAMES[entityName]} deve ser uma string.`,
  }

  return z
    .object({
      type: z.literal('api'),
      id: z.string({ required_error, invalid_type_error }),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional()
}
