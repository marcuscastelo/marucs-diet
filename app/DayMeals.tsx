"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Meal, { MealProps } from "./Meal";
import { useEffect, useState } from "react";
import { useUser } from "@/redux/features/userSlice";

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
                    />
                )
            }
        </div>
    )
}