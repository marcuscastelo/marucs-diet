"use client";

import Meal, { MealProps } from "./Meal";

export type DayMealsProps = {
    mealsProps: MealProps[],
    className?: string
}

export default function DayMeals({ mealsProps, className }: DayMealsProps) {
    return (
        <div className={className}>
            {
                mealsProps.map((mealProps, index) =>
                    <Meal
                        key={index}
                        {...mealProps}
                        className="mt-2"
                    />
                )
            }
        </div>
    )
}