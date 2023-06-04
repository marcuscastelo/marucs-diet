'use client';

import MealItem from "@/app/MealItem";
import { listFoods } from "@/controllers/food";
import { FoodData } from "@/model/foodModel";
import { Alert, Breadcrumb } from "flowbite-react";
import { useEffect, useState } from "react";
import PageLoading from "../../../PageLoading";
import MealItemAddModal, { showMealItemAddModal } from "../../../MealItemAddModal";
import { mockFood, mockMeal } from "../../../test/unit/(mock)/mockData";
import { MealItemData } from "@/model/mealItemModel";
import { notFound, usePathname } from "next/navigation";
import { listDays, updateDay } from "@/controllers/days";
import { DayData } from "@/model/dayModel";
import { Record } from "pocketbase";

export default function Page(context: any) {
    const dayParam = context.params.date as string;

    const [search, setSearch] = useState('' as string);
    const [foods, setFoods] = useState([] as (FoodData & Record)[]);
    const [days, setDays] = useState([] as (DayData & Record)[]);
    const [selectedFood, setSelectedFood] = useState(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }));

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    const fetchDays = async () => {
        const days = await listDays();
        setDays(days);
    }

    useEffect(() => {
        fetchFoods();
        fetchDays();
    }, []);


    if (foods.length == 0) {
        return <PageLoading message="Carregando alimentos" />
    }

    if (days.length == 0) {
        return <PageLoading message="Carregando dias" />
    }

    const filteredFoods = foods.filter(
        (food) => {
            if (search == "") {
                return true;
            }

            // Fuzzy search
            const searchLower = search.toLowerCase();
            const nameLower = food.name.toLowerCase();
            const searchWords = searchLower.split(" ");
            const nameWords = nameLower.split(" ");

            for (const searchWord of searchWords) {
                let found = false;
                for (const nameWord of nameWords) {
                    if (nameWord.startsWith(searchWord)) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return false;
                }
            }

            return true;
        }
    ).slice(0, 100);

    const day = days.find((day) => day.targetDay == dayParam);

    if (!day) {
        return <>
            <Alert color="red" className="mt-2">Dia não encontrado {dayParam}.</Alert>
            <div className="bg-gray-800 p-1">
                Dias disponíveis:
                {JSON.stringify(days.map(d=>d.targetDay), null, 2)}
            </div>
        </>
    }

    const meal = day.meals.find((meal) => meal.id == context.params.mealId);

    if (!meal) {
        return <>
            <Alert color="red" className="mt-2">Refeição não encontrada {context.params.mealId}.</Alert>
            <div className="bg-gray-800 p-1">
                Refeições disponíveis para o dia {dayParam}:&nbsp;
                {JSON.stringify(day.meals.map(m=>m.id), null, 2)}
            </div>
        </>
    }

    const onNewMealItem = async (mealItem: MealItemData) => {
        await updateDay(day.id, {
            ...day,
            meals: day.meals.map((m) => {
                if (m.id == meal.id) {
                    return {
                        ...m,
                        items: [...m.items, mealItem]
                    }
                }

                return m;
            })
        });
        window.location.href = `/`;
    }

    return (
        <>
            <Breadcrumb
                aria-label="Solid background breadcrumb example"
                className="bg-gray-50 px-5 py-3 dark:bg-gray-900"
            >
                <Breadcrumb.Item
                    href="#"
                >
                    <p>
                        Home
                    </p>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="#">
                    {dayParam}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {meal.name}
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" id="default-search" className="block w-full p-4 pl-10 text-sm bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Buscar alimentos" required />
            </div>

            {filteredFoods.length == 0 && <Alert color="warning" className="mt-2">Nenhum alimento encontrado para a busca &quot;{search}&quot;.</Alert>}

            <MealItemAddModal modalId="MealItemAddModal" meal={meal} food={selectedFood}
                onAdd={async (i) => onNewMealItem(i)}
            />

            <div className="bg-gray-800 p-1">
                {
                    filteredFoods.map((food, idx) =>
                        <div key={idx}>
                            <MealItem
                                className="mt-1"
                                key={idx}
                                food={food} quantity={100}
                                onClick={() => {
                                    setSelectedFood(food);
                                    showMealItemAddModal('MealItemAddModal')
                                }}
                            />
                        </div>
                    )
                }
            </div>

        </>
    );
}