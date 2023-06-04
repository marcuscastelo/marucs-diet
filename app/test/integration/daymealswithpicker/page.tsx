"use client";

import { DayData } from "@/model/dayModel";
import { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { mockMeal } from "../../unit/(mock)/mockData";
import DayMeals from "@/app/DayMeals";
import { Alert } from "flowbite-react";
import { MealProps } from "@/app/Meal";

export default function Page() {
    const day1: DayData = {
        targetDay: new Date().toISOString().split('T')[0],
        meals: [
            mockMeal({ name: 'Café da manhã' }),
            mockMeal({ name: 'Almoço' }),
        ]
    }

    const day2: DayData = {
        targetDay: new Date().toISOString().split('T')[0],
        meals: [
            mockMeal({ name: 'Jejum' }),
        ]
    }

    const day1MealProps = day1.meals.map(meal => {
        return {
            mealData: meal,
            onNewItem: () => {alert('Dia 1') }
        }
    });

    const day2MealProps = day2.meals.map(meal => {
        return {
            mealData: meal,
            onNewItem: () => {alert('Dia 2!!') }
        }
    });

    const [day, setDay] = useState({
        startDate: new Date(),
        endDate: new Date()
    } as DateValueType);
    const [currentMealProps, setCurrentMealProps] = useState(null as (MealProps[] | null));

    const handleDayChange = (newValue: DateValueType) => {
        const dateString = newValue?.startDate;
        if (!dateString) {
            alert('Data inválida');
            return;
        }
        const date = new Date(`${dateString}T00:00:00`);
        const dayOfMonth = date.getDate();
        setDay(newValue);
        if (dayOfMonth % 2 === 0) {
            setCurrentMealProps(day2MealProps);
        }
        else {
            setCurrentMealProps(day1MealProps);
        }
    }

    return (
        <>
            <Datepicker
                asSingle={true}
                useRange={false}
                readOnly={true}
                value={day}
                onChange={handleDayChange}
            />

            {currentMealProps === null && <Alert color="warning">Selecione uma data</Alert>}
            {currentMealProps !== null && <DayMeals mealsProps={currentMealProps} />}
            
        </>
    );
}