"use client";

import { MealItemData } from "@/model/mealItemModel";
import MacroNutrients from "./MacroNutrients";
import { MacroNutrientsData } from "@/model/macroNutrientsModel";

export type MealItemProps = {
    mealItem: MealItemData,
    className?: string,
    onClick?: (mealItem: MealItemData) => void
    favorite?: boolean,
    setFavorite?: (favorite: boolean) => void
}

export default function MealItem(props: MealItemProps) {
    const foodMacros: MacroNutrientsData = {
        carbs: parseFloat(props.mealItem.food?.components?.['Carboidrato total']?.[0] ?? ''),
        protein: parseFloat(props.mealItem.food?.components?.['Proteína']?.[0] ?? ''),
        fat: parseFloat(props.mealItem.food?.components?.['Lipídios']?.[0] ?? ''),
    }

    const multipliedMacros: MacroNutrientsData = {
        carbs: foodMacros.carbs * props.mealItem.quantity / 100,
        protein: foodMacros.protein * props.mealItem.quantity / 100,
        fat: foodMacros.fat * props.mealItem.quantity / 100,
    }

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        props.onClick?.(props.mealItem);
    }

    return (
        <>
            <a href="#" onClick={onClick} className={`block p-3 bg-gray-700 border border-gray-700 rounded-lg shadow hover:bg-gray-700 ${props.className ?? ''}`}>
                <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5>
                <h5 className="mb-2 text-lg font-bold tracking-tight text-white">{props.mealItem.food.name} </h5>

                <div className="flex">
                    <MacroNutrients {...multipliedMacros} />
                    <span className="ml-auto text-white"> {props.mealItem.quantity}g </span>
                </div>
            </a>
        </>
    )
}