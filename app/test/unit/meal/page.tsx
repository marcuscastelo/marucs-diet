"use client";

import MealItem from "@/app/MealItem";
import MacroNutrients from "../../../MacroNutrients";
import { mockItem, mockMeal } from "../(mock)/mockData";
import { MealData } from "@/model/mealModel";
import Meal from "@/app/Meal";
import { useState } from "react";
import { duplicateLastMealItem } from "../(mock)/mockActions";

export default function MealPage() {
    const [meal, setMeal] = useState(mockMeal());

    return (
        <Meal 
            mealData={meal} 
            onNewItem={() => duplicateLastMealItem(meal, setMeal)}
            onEditItem={() => {}}
        />
    )
}