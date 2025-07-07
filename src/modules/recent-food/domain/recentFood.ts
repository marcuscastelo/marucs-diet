import { z } from 'zod'

import { foodSchema } from '~/modules/diet/food/domain/food'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import type { Template } from '~/modules/diet/template/domain/template'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// Enhanced Template with usage metadata from recent foods
export const recentTemplateSchema = z.object({
  template: z.union([foodSchema, recipeSchema]),
  usage_metadata: z.object({
    recent_food_id: z.number(),
    last_used: z.coerce.date(),
    times_used: z.number(),
  }),
  __type: z.literal('RecentTemplate'),
})

export type RecentTemplate = Readonly<z.infer<typeof recentTemplateSchema>>

/**
 * Creates a RecentTemplate from a Template and usage metadata
 */
export function createRecentTemplate(
  template: Template,
  recentFoodId: number,
  lastUsed: Date,
  timesUsed: number,
): RecentTemplate {
  return parseWithStack(recentTemplateSchema, {
    template,
    usage_metadata: {
      recent_food_id: recentFoodId,
      last_used: lastUsed,
      times_used: timesUsed,
    },
    __type: 'RecentTemplate',
  })
}
