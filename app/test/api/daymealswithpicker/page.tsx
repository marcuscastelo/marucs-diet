"use client";

import DayMeals from "@/app/DayMeals";
import { MealProps } from "@/app/Meal";
import { listDays, updateDay } from "@/controllers/days";
import { DayData } from "@/model/dayModel";
import { MealData } from "@/model/mealModel";
import { useUser } from "@/redux/features/userSlice";
import { stringToDate } from "@/utils/dateUtils";
import { Record } from "pocketbase";
import { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";

export default function Page() {
    const [days, setDays] = useState<DayData[]>([]); // TODO: remove Record when id is not optional
    const [mealProps, setMealProps] = useState<MealProps[][]>([]);

    const [selectedDay, setSelectedDay] = useState('');

    const currentUser = useUser();

    const fetchDays = async (userId: string) => {
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

    const handleDayChange = (newValue: DateValueType) => {
        if (!newValue?.startDate) {
            setSelectedDay('');
            return;
        }

        const dateString = newValue?.startDate;
        const date = stringToDate(dateString);
        setSelectedDay(date.toISOString().split('T')[0]); // TODO: use dateUtils when this is understood
    }

    useEffect(() => {
        if (currentUser.loading) {
            return;
        }
            
        fetchDays(currentUser.data.id);
    }, [currentUser]);

    const duplicateLastMealItemOnDatabase = async (day: DayData, meal: MealData) => {
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

        await fetchDays(day.owner);
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
                            dayData.meals.map((meal): MealProps => {
                                return {
                                    mealData: meal,
                                    onNewItem: () => duplicateLastMealItemOnDatabase(dayData, meal),
                                    onEditItem: () => alert('onEditItem'),
                                    onUpdateMeal: () => alert('onUpdateMeal'),
                                };
                            })
                        } />
                </>
            }

            {/* {currentMealProps === null && <Alert color="warning">Selecione uma data</Alert>} */}
            {/* {currentMealProps !== null && <DayMeals mealsProps={currentMealProps} />} */}

        </>
    )
}