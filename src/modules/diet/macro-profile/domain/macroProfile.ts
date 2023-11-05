import { z } from 'zod'

export const macroProfileSchema = z.object({
  id: z.number(),
  owner: z.number(),
  target_day: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  gramsPerKgCarbs: z.number(),
  gramsPerKgProtein: z.number(),
  gramsPerKgFat: z.number(),
})

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
