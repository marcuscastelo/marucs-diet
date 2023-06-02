import MealItem from "@/app/MealItem";
import MacroNutrients from "../../MacroNutrients";
import { MealItemData } from "@/model/mealItemModel";
import { mockItem } from "../(mock)/mockItemData";

export default async function MealItemPage() {
    return (
        <MealItem {...mockItem} />
    )
}