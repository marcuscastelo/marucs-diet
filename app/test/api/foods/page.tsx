"use client";

import MealItem from "@/app/(mealItem)/MealItem";
import { upsertFood, listFoods } from "@/controllers/food";
import { Food } from "@/model/foodModel";
import { useEffect, useState } from "react";

export default function Page() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [search, setSearch] = useState<string>('');

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    useEffect(() => {
        fetchFoods();
    }, []);

    return (
        <>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" id="default-search" className="block w-full p-4 pl-10 text-sm bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Buscar alimentos" required />
                {/* <button type="submit" className="text-white absolute right-2.5 bottom-2.5 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Search</button> */}
            </div>

            {
                foods.filter(
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
                ).slice(0, 100).map((food, idx) =>
                    <div key={idx}>
                        <MealItem
                            key={idx}
                            mealItem={{
                                id: 123,
                                food: food,
                                quantity: 100,
                            }}
                        />
                    </div>
                )
            }
        </>
    )
}