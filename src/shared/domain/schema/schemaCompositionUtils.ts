import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * Utility functions for composing schemas following the New/Persisted Entity Pattern.
 * Helps reduce duplication while maintaining the architectural pattern.
 */

/**
 * Creates a new entity schema from a base persisted schema by omitting id and adding newType.
 */
export function createNewEntitySchema<
  T extends z.ZodRawShape,
  K extends string,
>(
  persistedSchema: z.ZodObject<
    T & {
      id: z.ZodNumber
      __type: z.ZodEffects<
        z.ZodOptional<z.ZodNullable<z.ZodString>>,
        string,
        string | null | undefined
      >
    }
  >,
  newTypeName: K,
) {
  return persistedSchema.omit({ id: true, __type: true }).extend({
    __type: z.literal(newTypeName),
  })
}

/**
 * Helper to create promote functions that add id and transform __type.
 */
export function createPromoteFunction<
  TNew extends { __type: string },
  TPersisted extends { id: number; __type: string },
>(persistedSchema: z.ZodSchema<TPersisted>, persistedTypeName: string) {
  return function promote(newEntity: TNew, id: number): TPersisted {
    return parseWithStack(persistedSchema, {
      ...newEntity,
      id,
      __type: persistedTypeName,
    })
  }
}

/**
 * Helper to create demote functions that remove id and transform __type.
 */
export function createDemoteFunction<
  TNew extends { __type: string },
  TPersisted extends { id: number; __type: string },
>(newSchema: z.ZodSchema<TNew>, newTypeName: string) {
  return function demote(persistedEntity: TPersisted): TNew {
    const { id, __type, ...rest } = persistedEntity
    return parseWithStack(newSchema, {
      ...rest,
      __type: newTypeName,
    })
  }
}
