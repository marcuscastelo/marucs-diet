"use client";

import MealItem from "@/app/MealItem";
import MacroNutrients from "../../../MacroNutrients";
import { mockItem, mockMeal } from "../(mock)/mockData";
import { MealData } from "@/model/mealModel";
import Meal from "@/app/Meal";
import { useState } from "react";
import { duplicateLastMealItem } from "../(mock)/mockActions";

export default function DayPage() {
    const [meal1, setMeal1] = useState(mockMeal);
    const [meal2, setMeal2] = useState(mockMeal);
    const [meal3, setMeal3] = useState(mockMeal);

    return (
        <>
            <Meal {...meal1} onNewItem={()=>{duplicateLastMealItem(meal1, setMeal1)}}/>
            <Meal {...meal2} onNewItem={()=>{duplicateLastMealItem(meal2, setMeal2)}}/>
            <Meal {...meal3} onNewItem={()=>{duplicateLastMealItem(meal3, setMeal3)}}/>
        </>
    )
}