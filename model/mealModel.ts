import { MealItemData } from "./mealItemModel";

export type MealData = {
    id: string;
    name: string;
    items: MealItemData[];
};