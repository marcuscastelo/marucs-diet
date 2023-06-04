import { FoodData } from "./foodModel";
import { MacroNutrientsData } from "./macroNutrientsModel";

export type MealItemAddData = Omit<MealItemData, 'id' | 'mealId'>;
export type MealItemEditData = MealItemData;

export type MealItemData = {
    id: string;
    food: FoodData;
    quantity: number;
};