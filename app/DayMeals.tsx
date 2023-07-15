"use client";

import { useUser } from "@/utils/localStorage";
import Meal, { MealProps } from "./Meal";
import { useEffect, useState } from "react";

export default function DayMeals({ mealsProps: originalMealsProps, className }: { mealsProps: MealProps[], className?: string }) {

    const [user, _] = useUser();

    const [mealsProps, setMealProps] = useState<MealProps[]>(originalMealsProps);

    useEffect(() => {
        if (user === 'Simone') setMealProps([])
        else setMealProps(originalMealsProps)
    }, [user, originalMealsProps])

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