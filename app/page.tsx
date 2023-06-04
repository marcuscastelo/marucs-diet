'use client';

import { useEffect, useState } from "react";
import DayMeals from "./DayMeals";
import { DayData } from "@/model/dayModel";
import { MealProps } from "./Meal";
import { listFoods } from "@/controllers/food";

export default function Page() {
    const today = new Date();
    // Format date to YYYY-MM-DD
    const todayFormatted = today.toISOString().split('T')[0];

    const [dayData, setDayData] = useState<DayData | null>(null);
    const [mealsProps, setMealsProps] = useState<MealProps[] | null>(null);

    useEffect(() => {
    }, []);

    return (
        <>
            {mealsProps === null && <div>Loading...</div>}
            {mealsProps !== null && <DayMeals mealsProps={mealsProps} />}
        </>
    )
}