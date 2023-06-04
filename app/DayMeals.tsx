"use client";

import Meal, { MealProps } from "./Meal";

export default function DayMeals({ mealsProps, className }: { mealsProps: MealProps[], className?: string }) {

    return (
        <div className={className}>
            {
                mealsProps.map((mealProps, index) =>
                    <Meal
                        key={index}
                        {...mealProps}
                    />
                )
            }
        </div>
    )
}