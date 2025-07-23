import { z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

// DAO schema for database record (current unified format)
export const mealDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(unifiedItemSchema),
})
