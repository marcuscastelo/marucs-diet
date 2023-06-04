"use client";

import MacroNutrients from "./MacroNutrients";
import { MealData } from "@/model/mealModel";
import MealItem from "./MealItem";
import { MealItemData } from "@/model/mealItemModel";

export type MealProps = { mealData: MealData, onNewItem: () => void, onEditItem: (item: MealItemData) => void };

export default function Meal({ mealData, onNewItem, onEditItem }: MealProps) {
    return (
        <>
            <div className="bg-gray-800 p-3">
                <h5 className="text-3xl mb-2">{mealData.name}</h5>
                {
                    mealData.items.map((item, index) =>
                        <div key={index} className="mt-2">
                            <MealItem
                                {...item}
                                onClick={onEditItem}
                            />
                        </div>
                    )
                }
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                    onClick={onNewItem}
                >
                    Adicionar item
                </button>

            </div>
        </>
    )
}