import { MealData } from "./mealModel";

export type DayData = {
    id: string;
    creationDate: string;
    meals: MealData[];
};