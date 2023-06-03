"use client";

import { mockMeal } from "../(mock)/mockData";
import { Dispatch, SetStateAction, useState } from "react";
import DayMeals from "@/app/DayMeals";
import { MealProps } from "@/app/Meal";
import { duplicateLastMealItem } from "../(mock)/mockActions";
import { MealData } from "@/model/mealModel";

export default function DayPage() {
    const createMealProps = ([meal, setMeal]: [meal: MealData, setMeal: Dispatch<SetStateAction<MealData>>]) => {
        return {
            mealData: meal,
            onNewItem: () => {
                duplicateLastMealItem(meal, setMeal);
            }
        } as MealProps;
    }

    return (
        <>
            <DayMeals mealsProps={[
                createMealProps(useState(mockMeal({name: 'Café da manhã'}))),
                createMealProps(useState(mockMeal({name: 'Almoço'}))),
                createMealProps(useState(mockMeal({name: 'Oi mãe'})))
            ]} />
        </>
    )
}