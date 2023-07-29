import { MealItemData, mealItemSchema } from "./mealItemModel";

import { z } from "zod";

export const mealSchema = z.object({
    id: z.number(),
    name: z.string(),
    items: z.array(mealItemSchema),
});

export type MealData = z.infer<typeof mealSchema>;