import { type z } from 'zod/v4'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { createZodEntity } from '~/shared/domain/validation'

const ze = createZodEntity('Recipe')

// Legacy schemas for database compatibility (using Item[])
export const {
  schema: recipeSchema,
  newSchema: newRecipeSchema,
  createNew: createNewRecipe,
  promote: promoteToRecipe,
} = ze.create({
  name: ze.string(),
  owner: ze.number(),
  items: ze.array(itemSchema).readonly(),
  prepared_multiplier: ze.number().default(1),
})

export const {
  schema: unifiedRecipeSchema,
  newSchema: newUnifiedRecipeSchema,
  createNew: createNewUnifiedRecipe,
  promote: promoteToUnifiedRecipe,
} = ze.create({
  name: ze.string(),
  owner: ze.number(),
  items: ze.array(unifiedItemSchema).readonly(),
  prepared_multiplier: ze.number().default(1),
})

// Legacy types (using Item[])
export type NewRecipe = Readonly<z.infer<typeof newRecipeSchema>>
export type Recipe = Readonly<z.infer<typeof recipeSchema>>
// New types (using UnifiedItem[])
export type NewUnifiedRecipe = Readonly<z.infer<typeof newUnifiedRecipeSchema>>
export type UnifiedRecipe = Readonly<z.infer<typeof unifiedRecipeSchema>>
