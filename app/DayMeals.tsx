"use client";

import Meal, { MealProps } from "./Meal";

export default function DayMeals({ mealsProps }: { mealsProps: MealProps[] }) {

    return (
        <>
            {
                mealsProps.map((mealProps, index) =>
                    <Meal
                        key={index}
                        {...mealProps}
                    />
                )
            }
        </>
    )
}