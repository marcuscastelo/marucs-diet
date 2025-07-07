import { z } from 'zod'

/**
 * Centralized validation messages in Portuguese for consistent error handling across domain entities.
 * Reduces duplication and provides a single source of truth for validation texts.
 */
export const validationMessages = {
  id: {
    required: "O campo 'id' é obrigatório.",
    invalid_type: "O campo 'id' deve ser um número.",
  },
  name: {
    required: "O campo 'name' é obrigatório.",
    invalid_type: "O campo 'name' deve ser uma string.",
  },
  owner: {
    required: "O campo 'owner' é obrigatório.",
    invalid_type: "O campo 'owner' deve ser um número.",
  },
  ean: {
    required: "O campo 'ean' é obrigatório.",
    invalid_type: "O campo 'ean' deve ser uma string.",
  },
  description: {
    required: "O campo 'description' é obrigatório.",
    invalid_type: "O campo 'description' deve ser uma string.",
  },
  weight: {
    required: "O campo 'weight' é obrigatório.",
    invalid_type: "O campo 'weight' deve ser um número.",
  },
  target_timestamp: {
    required: "O campo 'target_timestamp' é obrigatório.",
    invalid_type: "O campo 'target_timestamp' deve ser uma data ou string.",
  },
  prepared_multiplier: {
    required: "O campo 'prepared_multiplier' é obrigatório.",
    invalid_type: "O campo 'prepared_multiplier' deve ser um número.",
  },
  favorite_foods: {
    required: "O campo 'favorite_foods' é obrigatório.",
    invalid_type: "O campo 'favorite_foods' deve ser uma lista de números.",
  },
  diet: {
    required: "O campo 'diet' é obrigatório.",
    invalid_type: "O campo 'diet' deve ser 'cut', 'normo' ou 'bulk'.",
  },
  birthdate: {
    required: "O campo 'birthdate' é obrigatório.",
    invalid_type: "O campo 'birthdate' deve ser uma string.",
  },
  desired_weight: {
    required: "O campo 'desired_weight' é obrigatório.",
    invalid_type: "O campo 'desired_weight' deve ser um número.",
  },
  height: {
    required: "O campo 'height' é obrigatório.",
    invalid_type: "O campo 'height' deve ser um número.",
  },
  waist: {
    required: "O campo 'waist' é obrigatório.",
    invalid_type: "O campo 'waist' deve ser um número.",
  },
  hip: {
    required: "O campo 'hip' é obrigatório.",
    invalid_type: "O campo 'hip' deve ser um número.",
  },
  neck: {
    required: "O campo 'neck' é obrigatório.",
    invalid_type: "O campo 'neck' deve ser um número.",
  },
  items: {
    required: "O campo 'items' é obrigatório.",
    invalid_type:
      "O campo 'items' deve ser uma lista de itens e não pode ser vazio.",
  },
  recipe: {
    required: "O campo 'recipe' é obrigatório.",
    invalid_type: "O campo 'recipe' deve ser um número.",
  },
  source: {
    id: {
      required: "O campo 'id' da fonte é obrigatório.",
      invalid_type: "O campo 'id' da fonte deve ser uma string.",
    },
  },
} as const

/**
 * Creates a number field with standardized validation messages.
 */
export function createNumberField(
  fieldName:
    | 'id'
    | 'owner'
    | 'weight'
    | 'desired_weight'
    | 'height'
    | 'waist'
    | 'hip'
    | 'neck'
    | 'prepared_multiplier',
) {
  const messages = validationMessages[fieldName]
  return z.number({
    required_error: messages.required,
    invalid_type_error: messages.invalid_type,
  })
}

/**
 * Creates a string field with standardized validation messages.
 */
export function createStringField(
  fieldName: 'name' | 'ean' | 'diet' | 'birthdate' | 'description',
) {
  const messages = validationMessages[fieldName]
  return z.string({
    required_error: messages.required,
    invalid_type_error: messages.invalid_type,
  })
}

/**
 * Creates a nullable string field with standardized validation messages.
 */
export function createNullableStringField(fieldName: 'ean' | 'description') {
  const messages = validationMessages[fieldName]
  return z
    .string({
      required_error: messages.required,
      invalid_type_error: messages.invalid_type,
    })
    .nullable()
}
