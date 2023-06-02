import { MealItemData } from "@/model/mealItemModel";
import MacroNutrients from "./MacroNutrients";

export default async function MealItem(props: MealItemData) {
    return (
        <>
            <a href="#" className="block p-6 bg-gray-800 border border-gray-700 rounded-lg shadow hover:bg-gray-700">
                <h5 className="mb-2 text-md font-bold tracking-tight text-white">{props.food.name}</h5>

                <div className="flex">
                    <MacroNutrients {...props.food.macros} />
                    <span className="ml-auto text-white"> {props.quantity}g </span>
                </div>

            </a>
        </>
    )
}