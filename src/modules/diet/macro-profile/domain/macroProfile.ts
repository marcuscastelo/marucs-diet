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

/**
 * Creates a new MacroProfile with default values.
 * Used for initializing new macro profiles before saving to database.
 *
 * @param owner - User ID who owns this macro profile
 * @param targetDay - Date for which this profile applies
 * @returns A new MacroProfile with default values for all macro nutrients
 */
export function createMacroProfile(owner: number, targetDay: Date): MacroProfile {
  return {
    id: -1,
    owner,
    target_day: targetDay,
    gramsPerKgCarbs: 0,
    gramsPerKgProtein: 0,
    gramsPerKgFat: 0,
  }
}
