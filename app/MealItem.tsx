"use client";

import { MealItemData } from "@/model/mealItemModel";
import MacroNutrients from "./MacroNutrients";
import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { calculateCalories } from "./MacroTargets";

export type MealItemProps = {
    mealItem: MealItemData,
    className?: string,
    onClick?: (mealItem: MealItemData) => void
    favorite: boolean | 'hide',
    setFavorite?: (favorite: boolean) => void
}

export default function MealItem(props: MealItemProps) {
    const foodMacros = props.mealItem.food.macros;

    const multipliedMacros: MacroNutrientsData = {
        carbs: foodMacros.carbs * props.mealItem.quantity / 100,
        protein: foodMacros.protein * props.mealItem.quantity / 100,
        fat: foodMacros.fat * props.mealItem.quantity / 100,
    }

    const onClick = (e: React.MouseEvent) => {
        props.onClick?.(props.mealItem);
        e.stopPropagation();
        e.preventDefault();
    }

    const toggleFavorite = (e: React.MouseEvent) => {
        props.setFavorite?.(!props.favorite);
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <>
            <a href="#" className={`block p-3 bg-gray-700 border border-gray-700 rounded-lg shadow hover:bg-gray-700 ${props.className ?? ''}`} onClick={onClick}>
                <div className="flex">
                    <div className="">
                        {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
                        {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
                        <h5 className="mb-2 text-lg font-bold tracking-tight text-white">{props.mealItem.food.name} </h5>
                    </div>
                    {
                        props.favorite !== 'hide' &&
                        <div className="ml-auto text-3xl hover:text-blue-200" onClick={toggleFavorite}>
                            {props.favorite ? "★" : "☆"}
                        </div>
                    }

                </div>

                <div className="flex">
                    <MacroNutrients {...multipliedMacros} />
                    <div className="ml-auto">
                    <span className="text-white"> {props.mealItem.quantity}g </span>
                    |
                    <span className="text-white"> {calculateCalories({
                        gramsCarbs: props.mealItem.food.macros.carbs * props.mealItem.quantity / 100,
                        gramsProtein: props.mealItem.food.macros.protein * props.mealItem.quantity / 100,
                        gramsFat: props.mealItem.food.macros.fat * props.mealItem.quantity / 100,
                    }).toFixed(0)}kcal </span>
                    </div>

                </div>
            </a>
        </>
    )
}