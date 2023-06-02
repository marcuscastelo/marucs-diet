import MealItem from "@/app/MealItem";
import MacroNutrients from "../../MacroNutrients";
import { mockItem } from "../(mock)/mockItemData";
import { MealData } from "@/model/mealModel";
import Meal from "@/app/Meal";

export default async function DayPage() {

    const mockMeal: MealData = {
        id: '1',
        items: [mockItem, mockItem, mockItem],
        name: 'Café da manhã',
    };

    return (
        <>
            <Meal {...mockMeal} />
            <Meal {...mockMeal} />
            <Meal {...mockMeal} />
        </>
    )
}