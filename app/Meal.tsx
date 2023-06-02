import MacroNutrients from "./MacroNutrients";
import { MealData } from "@/model/mealModel";
import MealItem from "./MealItem";

export default async function Meal(props: MealData) {
    return (
        <>
            <div className="bg-gray-600 p-3">
                <h5 className="text-3xl mb-2">Café da manhã</h5>
                {
                    props.items.map((item, _index) =>
                        <div key={item.id} className="mt-2">
                            <MealItem {...item} />
                        </div>
                    )
                }
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3">
                    Adicionar item
                </button>

            </div>
        </>
    )
}