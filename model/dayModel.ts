import { z } from "zod";
import { mealSchema } from "./mealModel";

export const daySchema = z.object({
    id: z.number(),
    target_day: z.string(), //TODO: use supabase date type
    owner: z.number(),
    meals: z.array(mealSchema),
});

export type Day = z.infer<typeof daySchema>;
