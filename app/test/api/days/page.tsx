"use client";

import DayMeals from "@/app/DayMeals";
import { MealProps } from "@/app/Meal";
import MealItem from "@/app/MealItem";
import { listDays } from "@/controllers/days";
import { createFood, listFoods } from "@/controllers/food";
import { DayData } from "@/model/dayModel";
import { FoodData } from "@/model/foodModel";
import { Suspense, useEffect, useState } from "react";

export default function Page() {
    const [days, setDays] = useState([] as DayData[]);
    const [mealProps, setMealProps] = useState([] as MealProps[][]);

    const fetchDays = async () => {
        const days = await listDays();
        setDays(days);
        
        const mealProps = days.map((day) => {
            return day.meals.map((meal) => {
                return {
                    mealData: meal,
                    onNewItem: () => console.log("onNewItem"),
                } as MealProps;
            })
        })
        setMealProps(mealProps);
    }

    useEffect(() => {
        fetchDays();
    }, []);

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                {days.map((day, idx) =>
                    <div key={idx}>
                        <div className="text-2xl font-bold">{day.targetDay}</div>
                        <DayMeals mealsProps={mealProps[idx]} />
                    </div>
                )}
            </Suspense>
        </>
    )
}