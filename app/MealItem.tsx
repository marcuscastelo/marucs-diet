"use client";

import { MealItemData } from "@/model/mealItemModel";
import MacroNutrients from "./MacroNutrients";
import { MacroNutrientsData } from "@/model/macroNutrientsModel";

export default function MealItem(props: MealItemData & { className?: string, onClick?: (mealItem: MealItemData) => void }) {
    const foodMacros: MacroNutrientsData = {
        carbs: parseFloat(props.food?.components?.['Carboidrato total']?.[0] ?? ''),
        protein: parseFloat(props.food?.components?.['Proteína']?.[0] ?? ''),
        fat: parseFloat(props.food?.components?.['Lipídios']?.[0] ?? ''),
    }

    const multipliedMacros: MacroNutrientsData = {
        carbs: foodMacros.carbs * props.quantity / 100,
        protein: foodMacros.protein * props.quantity / 100,
        fat: foodMacros.fat * props.quantity / 100,
    }

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        props.onClick?.(props);
    }

    return (
        <>
            <a href="#" onClick={onClick} className={`block p-3 bg-gray-700 border border-gray-700 rounded-lg shadow hover:bg-gray-700 ${props.className ?? ''}`}>
                <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.id}]</h5>
                <h5 className="mb-2 text-lg font-bold tracking-tight text-white">{props.food.name} </h5>

                <div className="flex">
                    <MacroNutrients {...multipliedMacros} />
                    <span className="ml-auto text-white"> {props.quantity}g </span>
                </div>
            </a>
        </>
    )
}