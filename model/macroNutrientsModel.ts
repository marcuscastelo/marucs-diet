import { z } from "zod";

export const MacroNutrientsSchema = z.object({
    calories: z.number().optional(),
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
});

export type MacroNutrientsData = z.infer<typeof MacroNutrientsSchema>;
