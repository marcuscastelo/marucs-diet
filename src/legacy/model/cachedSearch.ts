import { z } from 'zod'

export const cachedSearchSchema = z.object({
  search: z.string({ required_error: 'Search is required' }),
})

export type CachedSearch = Readonly<z.infer<typeof cachedSearchSchema>>
