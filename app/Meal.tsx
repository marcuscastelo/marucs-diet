import MacroNutrients from "./MacroNutrients";
import { MealData } from "@/model/mealModel";
import MealItem from "./MealItem";

export default async function Meal(props: MealData) {
    return (
        <>
            <div className="bg-gray-600 p-3">
                <h5 className="text-3xl mb-2">Café da manhã</h5>
                {
                    props.items.map((item, _index) => <MealItem key={item.id} {...item} />)
                }
            </div>
        </>
    )
}