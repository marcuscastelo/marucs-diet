"use client";

import { DayData } from "@/model/dayModel";
import { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { mockMeal } from "../../unit/(mock)/mockData";
import DayMeals from "@/app/DayMeals";
import { Alert } from "flowbite-react";
import { MealProps } from "@/app/Meal";
import { getToday, stringToDate } from "@/utils/dateUtils";

export default function Page() {
    const day1: DayData = {
        owner: 'user1',
        targetDay: getToday(),
        meals: [
            mockMeal({ name: 'Café da manhã' }),
            mockMeal({ name: 'Almoço' }),
        ]
    }

    const day2: DayData = {
        owner: 'user1',
        targetDay: getToday(),
        meals: [
            mockMeal({ name: 'Jejum' }),
        ]
    }

    const day1MealProps: MealProps[] = day1.meals.map(meal => {
        return {
            mealData: meal,
            onNewItem: () => {alert('Dia 1: Novo') },
            onEditItem: () => {alert('Dia 1: Editar') },
            onUpdateMeal: () => {alert('Dia 1: Atualizar') },
        }
    });

    const day2MealProps: MealProps[] = day2.meals.map(meal => {
        return {
            mealData: meal,
            onNewItem: () => {alert('Dia 2!!!: Novo') },
            onEditItem: () => {alert('Dia 2!!!: Editar') },
            onUpdateMeal: () => {alert('Dia 2!!!: Atualizar') },
        }
    });

    const [day, setDay] = useState<DateValueType>({
        startDate: getToday(),
        endDate: getToday(),
    });
    const [currentMealProps, setCurrentMealProps] = useState<MealProps[]>();

    const handleDayChange = (newValue: DateValueType) => {
        const dateString = newValue?.startDate;
        if (!dateString) {
            alert('Data inválida');
            return;
        }
        const date = stringToDate(dateString);
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

            {currentMealProps === undefined && <Alert color="warning">Selecione uma data</Alert>}
            {currentMealProps !== undefined && <DayMeals mealsProps={currentMealProps} />}
            
        </>
    );
}