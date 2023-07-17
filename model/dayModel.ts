import { MealData } from "./mealModel";

export type DayData = {
    targetDay: string;
    owner: string;
    meals: MealData[];
};