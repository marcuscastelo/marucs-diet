'use client';

import MealItem from "@/app/MealItem";
import { listFoods } from "@/controllers/food";
import { FoodData } from "@/model/foodModel";
import { Alert, Breadcrumb } from "flowbite-react";
import { useEffect, useState } from "react";
import PageLoading from "../PageLoading";
import MealItemAddModal, { showMealItemAddModal } from "../MealItemAddModal";
import { mockFood, mockMeal } from "../test/unit/(mock)/mockData";

export default function Page() {
    const [search, setSearch] = useState('' as string);
    const [foods, setFoods] = useState([] as FoodData[]);
    const [selectedFood, setSelectedFood] = useState(mockFood({name: 'BUG: SELECTED FOOD NOT SET'}));

    const meal = mockMeal({
        name: "Mocked meal",
    })

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    useEffect(() => {
        fetchFoods();
    }, []);

    if (foods.length == 0) {
        return <PageLoading message="Carregando alimentos" />
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
    ).slice(0,100);

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
                    2023-06-03
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {meal.name}
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" id="default-search" className="block w-full p-4 pl-10 text-sm bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Buscar alimentos" required/>
            </div>

            {filteredFoods.length == 0 && <Alert color="warning" className="mt-2">Nenhum alimento encontrado para a busca &quot;{search}&quot;.</Alert>}

            <MealItemAddModal modalId="MealItemAddModal" meal={meal} food={selectedFood} 
                onAdd={(item) => window.location.href = `/`} 
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