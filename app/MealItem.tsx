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
        <div 
            draggable={true} 
            onDrag={(e) => {
                console.log(e.clientX, e.clientY);
                // Reset all meal-item background colors
                const underlyingElement = document.elementFromPoint(e.clientX, e.clientY);
                console.log(underlyingElement);
                if (underlyingElement && underlyingElement !== e.currentTarget) {
                    const hasClassOrAnyParentHasClass = (element: Element, className: string): Element | null => {
                        if (element.classList.contains(className)) {
                            return element;
                        }
                        if (element.parentElement) {
                            return hasClassOrAnyParentHasClass(element.parentElement, className);
                        }
                        return null;
                    }

                    const mealItems = document.querySelectorAll('.meal-item');
                    mealItems.forEach((mealItem) => {
                        mealItem.classList.remove('bg-gray-900');
                        mealItem.classList.add('bg-gray-700');
                    });

                    const mealItem = hasClassOrAnyParentHasClass(underlyingElement, 'meal-item');
                        mealItem?.classList.remove('bg-gray-700');
                        mealItem?.classList.add('bg-gray-900');
                } else {
                    const mealItems = document.querySelectorAll('.meal-item');
                    mealItems.forEach((mealItem) => {
                        mealItem.classList.remove('bg-gray-900');
                        mealItem.classList.add('bg-gray-700');
                    });
                }
            }}
            onDragStart={(e) => {
                console.log(e.clientX, e.clientY);

                e.dataTransfer.setData("text/plain", JSON.stringify(props.mealItem));
            }}
            onDragEnd={(e) => {
                console.log(e.clientX, e.clientY);
                const mealItems = document.querySelectorAll('.meal-item');
                mealItems.forEach((mealItem) => {
                    mealItem.classList.remove('bg-gray-200');
                    mealItem.classList.add('bg-gray-700');
                });

                //TODO: reorder meal items (and move across meals)
                e.dataTransfer.setData("text/plain", JSON.stringify(props.mealItem));
            }}
            >
            <div className={`meal-item block p-3 bg-gray-700 border border-gray-700 rounded-lg shadow hover:bg-gray-700 hover:cursor-pointer ${props.className ?? ''}`} onClick={onClick}>
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
            </div>
        </div>
    )
}