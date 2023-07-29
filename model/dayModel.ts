import { MealData } from "./mealModel";
import { User } from "./userModel";

export type DayData = {
    id: string;
    targetDay: string;
    owner: User['id'];
    meals: MealData[];
};