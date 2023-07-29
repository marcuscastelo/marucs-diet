"use client";

import { mockMeal } from "../(mock)/mockData";
import { Dispatch, SetStateAction, useState } from "react";
import DayMeals from "@/app/DayMeals";
import Meal, { MealProps } from "@/app/(meal)/Meal";
import { duplicateLastMealItem } from "../(mock)/mockActions";
import { MealData } from "@/model/mealModel";

export default function DayPage() {
    const createMealProps = ([meal, setMeal]: [meal: MealData, setMeal: Dispatch<SetStateAction<MealData>>]): MealProps => {
        return {
            mealData: meal,
            actions:
                <Meal.Actions onNewItem={() => {
                    duplicateLastMealItem(meal, setMeal);
                }}/>
        };
    }

    return (
        <>
            <DayMeals mealsProps={[
                createMealProps(useState(mockMeal({ name: 'Café da manhã' }))),
                createMealProps(useState(mockMeal({ name: 'Almoço' }))),
                createMealProps(useState(mockMeal({ name: 'Oi mãe' })))
            ]} />
        </>
    )
}