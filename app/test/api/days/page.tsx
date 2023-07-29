"use client";

import DayMeals from "@/app/DayMeals";
import { MealProps } from "@/app/Meal";
import MealItem from "@/app/MealItem";
import { listDays } from "@/controllers/days";
import { createFood, listFoods } from "@/controllers/food";
import { DayData } from "@/model/dayModel";
import { Food } from "@/model/foodModel";
import { User } from "@/model/userModel";
import { useUser } from "@/redux/features/userSlice";
import { Suspense, useEffect, useState } from "react";

export default function Page() {
    const [days, setDays] = useState<DayData[]>([]);
    const [mealProps, setMealProps] = useState<MealProps[][]>([]);

    const currentUser = useUser();

    const fetchDays = async (userId: User['id']) => {
        const days = await listDays(userId);
        setDays(days);
        
        const mealProps = days.map((day) => {
            return day.meals.map((meal): MealProps => {
                return {
                    mealData: meal,
                    onNewItem: () => console.log("onNewItem"),
                    onEditItem: () => console.log("onEditItem"),
                    onUpdateMeal: () => console.log("onUpdateMeal"),
                };
            })
        })
        setMealProps(mealProps);
    }

    useEffect(() => {
        if (currentUser.loading) {
            return;
        }

        fetchDays(currentUser.data.id);
    }, [currentUser]);

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