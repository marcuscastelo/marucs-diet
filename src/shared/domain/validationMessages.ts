/**
 * Shared validation message utilities for Portuguese error messages.
 * Centralizes common validation patterns to reduce duplication across domain schemas.
 */

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
  id: (entityName: keyof typeof ENTITY_NAMES) => ({
    required_error: createRequiredFieldMessage('id', ENTITY_NAMES[entityName]),
    invalid_type_error: createInvalidTypeMessage(
      'id',
      ENTITY_NAMES[entityName],
      TYPE_DESCRIPTIONS.number,
    ),
  }),

  name: (entityName: keyof typeof ENTITY_NAMES) => ({
    required_error: createRequiredFieldMessage(
      'name',
      ENTITY_NAMES[entityName],
    ),
    invalid_type_error: createInvalidTypeMessage(
      'name',
      ENTITY_NAMES[entityName],
      TYPE_DESCRIPTIONS.string,
    ),
  }),

  owner: (entityName: keyof typeof ENTITY_NAMES) => ({
    required_error: createRequiredFieldMessage(
      'owner',
      ENTITY_NAMES[entityName],
    ),
    invalid_type_error: createInvalidTypeMessage(
      'owner',
      ENTITY_NAMES[entityName],
      TYPE_DESCRIPTIONS.number,
    ),
  }),

  targetTimestamp: (entityName: keyof typeof ENTITY_NAMES) => ({
    required_error: createRequiredFieldMessage(
      'target_timestamp',
      ENTITY_NAMES[entityName],
    ),
    invalid_type_error: createInvalidTypeMessage(
      'target_timestamp',
      ENTITY_NAMES[entityName],
      TYPE_DESCRIPTIONS.date,
    ),
  }),

  weight: (entityName: keyof typeof ENTITY_NAMES) => ({
    required_error: createRequiredFieldMessage(
      'weight',
      ENTITY_NAMES[entityName],
    ),
    invalid_type_error: createInvalidTypeMessage(
      'weight',
      ENTITY_NAMES[entityName],
      TYPE_DESCRIPTIONS.number,
    ),
  }),
} as const
