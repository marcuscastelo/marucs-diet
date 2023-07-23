import { MacroNutrientsSchema } from "./macroNutrientsModel";
import { z } from "zod";

export const FoodSchema = z.object({
    id: z.string(),
    name : z.string(),
    macros: MacroNutrientsSchema,
});

export type Food = z.infer<typeof FoodSchema>;