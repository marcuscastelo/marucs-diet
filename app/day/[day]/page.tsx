'use client';

import { useEffect, useState } from "react";
import DayMeals from "../../DayMeals";
import { DayData } from "@/model/dayModel";
import { MealProps } from "../../Meal";
import { listFoods } from "@/controllers/food";
import { FoodData } from "@/model/foodModel";
import PageLoading from "../../PageLoading";
import { listDays } from "@/controllers/days";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import Datepicker from "react-tailwindcss-datepicker";
import { Alert } from "flowbite-react";
import Show from "../../Show";
import DayMacros from "../../DayMacros";
import { MealData } from "@/model/mealModel";
import { MealItemData } from "@/model/mealItemModel";
import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { useRouter } from "next/navigation";

export default function Page(context: any) {
    const router = useRouter();

    const [foods, setFoods] = useState([] as FoodData[]);
    const [days, setDays] = useState([] as DayData[]);
    const selectedDay = context.params.day as string;

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    const fetchDays = async () => {
        const days = await listDays();
        setDays(days);
    }

    const handleDayChange = (newValue: DateValueType) => {
        if (!newValue?.startDate) {
            router.push('/day');
            return;
        }

        const dateString = newValue?.startDate;
        const date = new Date(`${dateString}T00:00:00`);
        const dayString = date.toISOString().split('T')[0];
        router.push(`/day/${dayString}`);
    }

    useEffect(() => {
        fetchFoods();
        fetchDays();
    }, []);

    const loading = days.length == 0 || foods.length == 0;

    if (loading) {
        return <PageLoading message="Carregando dias e alimentos"/>
    }

    const hasData = days.some((day) => day.targetDay === selectedDay);
    const dayData = days.find((day) => day.targetDay === selectedDay);

    const mealProps = dayData?.meals.map((meal) => {
        return {
            mealData: meal,
            onNewItem: () => {
                // Redirect to new item page
                window.location.href = `/newItem/${selectedDay}/${meal.id}`;
            }
        } as MealProps;
    });

    const foodMacros = (food: FoodData) => ({
        carbs: parseFloat(food.components['Carboidrato total']?.[0] ?? ''),
        protein: parseFloat(food.components['Proteína']?.[0] ?? ''),
        fat: parseFloat(food.components['Lipídios']?.[0] ?? ''),

    } as MacroNutrientsData);

    const mealItemMacros = (mealItem: MealItemData) => {
        const fm = foodMacros(mealItem.food);
        return {
            carbs: fm.carbs * mealItem.quantity / 100,
            protein: fm.protein * mealItem.quantity / 100,
            fat: fm.fat * mealItem.quantity / 100,
        } as MacroNutrientsData;
    };
        

    const mealMacros = (meal: MealData) => {
        return meal.items.reduce((acc, item) => {
            const itemMacros = mealItemMacros(item);
            acc.carbs += itemMacros.carbs;
            acc.protein += itemMacros.protein;
            acc.fat += itemMacros.fat;
            return acc;
        }, {
            carbs: 0,
            protein: 0,
            fat: 0,
        } as MacroNutrientsData);
    }

    const dayMacros = dayData?.meals.reduce((acc, meal) => {
        const mm = mealMacros(meal);
        acc.carbs += mm.carbs;
        acc.protein += mm.protein;
        acc.fat += mm.fat;
        return acc;
    }, {
        carbs: 0,
        protein: 0,
        fat: 0,
    } as MacroNutrientsData);

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

            <Show when={!selectedDay}>
                <Alert className="mt-2" color="warning">Selecione um dia</Alert>
            </Show>

            <Show when={!!selectedDay && !hasData}>
                <Alert className="mt-2" color="warning">Nenhum dado encontrado para o dia {selectedDay}</Alert>
            </Show>

            <Show when={!!selectedDay && hasData && !dayData}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados {selectedDay}</Alert>;
            </Show>

            <Show when={!!selectedDay && hasData && !!dayData && !mealProps}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados de refeições {selectedDay}</Alert>;
            </Show>

            <Show when={!!selectedDay && hasData && !!dayData && !!mealProps && !dayMacros}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados de macros {selectedDay}</Alert>;
            </Show>

            <Show when={hasData}>
                <DayMacros className="mt-3" 
                    macros={dayMacros!}
                />
                <DayMeals className="mt-5" mealsProps={mealProps!} />
            </Show>
        </>
    );
}