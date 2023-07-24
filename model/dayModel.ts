import { MealData } from "./mealModel";

export type DayData = {
    id?: string; //TODO: make mandatory
    targetDay: string;
    owner: string;
    meals: MealData[];
};