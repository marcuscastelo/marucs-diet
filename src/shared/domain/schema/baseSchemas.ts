import { z } from 'zod'

/**
 * Base schema for entities with ID field management.
 * Provides the common pattern for id field with standardized validation.
 */
export const entityBaseSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' é obrigatório.",
    invalid_type_error: "O campo 'id' deve ser um número.",
  }),
})

/**
 * Base schema for entities with owner field.
 * Used by Recipe, Weight, DayDiet, MacroProfile, BodyMeasure and others.
 */
export const ownedEntityBaseSchema = z.object({
  owner: z.number({
    required_error: "O campo 'owner' é obrigatório.",
    invalid_type_error: "O campo 'owner' deve ser um número.",
  }),
})

/**
 * Base schema for entities with name field.
 * Used by Food, Recipe, User, ItemGroup and others.
 */
export const namedEntityBaseSchema = z.object({
  name: z.string({
    required_error: "O campo 'name' é obrigatório.",
    invalid_type_error: "O campo 'name' deve ser uma string.",
  }),
})

/**
 * Base schema for entities with timestamp fields.
 * Used by Weight, BodyMeasure, MacroProfile and others.
 */
export const timestampedEntityBaseSchema = z.object({
  target_timestamp: z
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
    .transform((v) => new Date(v)),
})

/**
 * Creates a __type field that transforms to a const value for persisted entities.
 * Used for the New/Persisted Entity Pattern.
 */
export function createTypeField<T extends string>(typeName: T) {
  return z
    .string()
    .nullable()
    .optional()
    .transform(() => typeName)
}

/**
 * Creates a literal __type field for new entities.
 */
export function createNewTypeField<T extends string>(typeName: T) {
  return z.literal(typeName)
}

export type EntityBase = z.infer<typeof entityBaseSchema>
export type OwnedEntityBase = z.infer<typeof ownedEntityBaseSchema>
export type NamedEntityBase = z.infer<typeof namedEntityBaseSchema>
export type TimestampedEntityBase = z.infer<typeof timestampedEntityBaseSchema>
