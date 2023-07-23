import { MacroNutrientsSchema } from "./macroNutrientsModel";
import { z } from "zod";

export const FoodSchema = z.object({
    id: z.string(),
    source: z.object({
        type: z.union([z.literal('api'), z.literal('tbca')]),
        id: z.string(),
    }).optional(),
    name : z.string(),
    macros: MacroNutrientsSchema,
});

export type Food = z.infer<typeof FoodSchema>;