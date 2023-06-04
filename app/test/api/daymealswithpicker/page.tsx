"use client";

import DayMeals from "@/app/DayMeals";
import { MealProps } from "@/app/Meal";
import MealItem from "@/app/MealItem";
import { listDays, updateDay } from "@/controllers/days";
import { createFood, listFoods } from "@/controllers/food";
import { DayData } from "@/model/dayModel";
import { FoodData } from "@/model/foodModel";
import { MealData } from "@/model/mealModel";
import { Record } from "pocketbase";
import { Suspense, useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";

export default function Page() {
    const [days, setDays] = useState([] as (Record & DayData)[]);
    const [mealProps, setMealProps] = useState([] as MealProps[][]);

    const [selectedDay, setSelectedDay] = useState('');

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

    const handleDayChange = (newValue: DateValueType) => {
        if (!newValue?.startDate) {
            setSelectedDay('');
            return;
        }

        const dateString = newValue?.startDate;
        const date = new Date(`${dateString}T00:00:00`);
        setSelectedDay(date.toISOString().split('T')[0]);
    }

    useEffect(() => {
        fetchDays();
    }, []);

    const duplicateLastMealItemOnDatabase = async (day: Record & DayData, meal: MealData) => {
        await updateDay(day.id, {
            ...day,
            meals: day.meals.map((m) => {
                if (m.id !== meal.id) return m;

                const lastItem = m.items[m.items.length - 1];
                return {
                    ...m,
                    items: [...m.items, lastItem],
                }
            })
        });
        await fetchDays();
    }

    const hasData = days.some((day) => day.targetDay === selectedDay);
    const dayData = days.find((day) => day.targetDay === selectedDay);

    return (
        <>
            <Datepicker
                asSingle={true}
                useRange={false}
                readOnly={true}
                value={{
                    startDate: selectedDay,
                    endDate: selectedDay,
                }}
                onChange={handleDayChange}
            />

            <div className="text-2xl font-bold">selectedDay: {selectedDay}</div>
            <div>Has data: {hasData ? 'true' : 'false'}</div>
            <div>Known days: {days.map((day) => day.targetDay).join(', ')}</div>

            {
                hasData && dayData !== undefined &&
                <>
                    <h1> Target day: {dayData.targetDay}</h1>
                    <DayMeals
                        mealsProps={
                            dayData.meals.map((meal) => {
                                return {
                                    mealData: meal,
                                    onNewItem: () => duplicateLastMealItemOnDatabase(dayData, meal),
                                } as MealProps;
                            })
                        } />
                </>
            }

            {/* {currentMealProps === null && <Alert color="warning">Selecione uma data</Alert>} */}
            {/* {currentMealProps !== null && <DayMeals mealsProps={currentMealProps} />} */}

        </>
    )
}