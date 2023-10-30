import { z } from 'zod'

export const cachedEanSchema = z.object({
  ean: z.string({ required_error: 'EAN is required' }),
})

export type CachedEan = Readonly<z.infer<typeof cachedEanSchema>>
