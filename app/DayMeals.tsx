"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Meal, { MealProps } from "./Meal";
import { useEffect, useState } from "react";
import { useUser } from "@/redux/features/userSlice";

export type DayMealsProps = {
    mealsProps: MealProps[],
    className?: string
}

export default function DayMeals({ mealsProps: originalMealsProps, className }: DayMealsProps) {
    const currentUser = useUser();

    const [mealsProps, setMealProps] = useState<MealProps[]>(originalMealsProps);

    useEffect(() => {
        if (currentUser.loading) {
            return;
        }

        if (currentUser.data.name === 'Simone') setMealProps([])
        else setMealProps(originalMealsProps)
    }, [currentUser, originalMealsProps])

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