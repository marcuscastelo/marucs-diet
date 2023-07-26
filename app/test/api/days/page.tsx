"use client";

import DayMeals from "@/app/DayMeals";
import Meal, { MealProps } from "@/app/(meal)/Meal";
import { listDays } from "@/controllers/days";
import { DayData } from "@/model/dayModel";
import { useUser } from "@/redux/features/userSlice";
import { Suspense, useEffect, useState } from "react";

export default function Page() {
    const [days, setDays] = useState<DayData[]>([]);
    const [mealProps, setMealProps] = useState<MealProps[][]>([]);

    const currentUser = useUser();

    const fetchDays = async (userId: string) => {
        const days = await listDays(userId);
        setDays(days);
        
        const mealProps = days.map((day) => {
            return day.meals.map((meal): MealProps => {
                return {
                    mealData: meal,
                    header: <Meal.Header onUpdateMeal={(meal) => alert(`Mock: Update meal ${meal.name}`)} />,
                    content: <Meal.Content onEditItem={(item) => alert(`Mock: Edit "${item.food.name}"`)                   } />,
                    actions: <Meal.Actions onNewItem={() => alert('Mock: New item')} />,
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