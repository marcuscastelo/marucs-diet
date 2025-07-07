import { z } from 'zod'

import {
  createNullableStringField,
  createNumberField,
  createStringField,
} from '~/shared/domain/schema/validationMessages'

/**
 * Helper function to create a __type field for entity identification
 */
export function createTypeField<T extends string>(value: T) {
  return z.literal(value)
}

/**
 * Helper function to create a __type field for new entity schemas
 */
export function createNewTypeField<T extends string>(value: T) {
  return z.literal(`new-${value}` as const)
}

/**
 * Helper function to create an id field
 */
export function createIdField() {
  return createNumberField('id')
}

/**
 * Helper function to create a userId field (for owned entities)
 */
export function createUserIdField() {
  return createNumberField('owner')
}

/**
 * Helper function to create a name field
 */
export function createNameField() {
  return createStringField('name')
}

/**
 * Helper function to create a description field (nullable)
 */
export function createDescriptionField() {
  return createNullableStringField('description')
}

/**
 * Helper function to create a createdAt field
 */
export function createCreatedAtField() {
  return z.date()
}

/**
 * Helper function to create an updatedAt field
 */
export function createUpdatedAtField() {
  return z.date()
}

/**
 * Helper function to create a target_timestamp field
 */
export function createTargetTimestampField() {
  return z
    .date({
      required_error: "O campo 'target_timestamp' é obrigatório.",
      invalid_type_error:
        "O campo 'target_timestamp' deve ser uma data ou string.",
    })
    .or(
      z.string({
        required_error: "O campo 'target_timestamp' é obrigatório.",
        invalid_type_error:
          "O campo 'target_timestamp' deve ser uma data ou string.",
      }),
    )
    .transform((v) => new Date(v))
}
