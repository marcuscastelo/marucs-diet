import { z } from 'zod/v4'

export const cachedSearchSchema = z.object({
  search: z.string(),
})

export type CachedSearch = Readonly<z.infer<typeof cachedSearchSchema>>
