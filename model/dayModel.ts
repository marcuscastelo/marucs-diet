import { MealData } from "./mealModel";

export type DayData = {
    targetDay: Date;
    meals: MealData[];
};