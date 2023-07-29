import { Food, foodSchema } from "./foodModel";

export type MealItemAddData = Omit<MealItemData, 'id' | 'mealId'>;
export type MealItemEditData = MealItemData;

import { z } from "zod";

export const mealItemSchema = z.object({
    id: z.number(),
    food: foodSchema,
    quantity: z.number(),
});

export type MealItemData = z.infer<typeof mealItemSchema>;