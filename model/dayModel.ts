import { MealData } from "./mealModel";

export type DayData = {
    id: string;
    targetDay: string;
    owner: string;
    meals: MealData[];
};