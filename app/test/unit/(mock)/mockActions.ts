import { MealData } from "@/model/mealModel";
import { Dispatch, SetStateAction } from "react";

export const duplicateLastMealItem = (meal: MealData, setMeal: Dispatch<SetStateAction<MealData>>) => {
    const lastItem = meal.items[meal.items.length - 1];
    const newItem = {
        ...lastItem,
        id: lastItem.id + 1,
    };
    setMeal({
        ...meal,
        items: [...meal.items, newItem],
    });
};