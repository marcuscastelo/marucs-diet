"use client";

import { upsertFood, listFoods } from "@/controllers/food";
import { Food } from "@/model/foodModel";
import { useEffect, useState } from "react";
import { mockFood } from "../../unit/(mock)/mockData";

export default function Page() {
    const [foods, setFoods] = useState<Food[]>([mockFood()]);

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    const addFood = async () => {
        console.log('addFood')
        await upsertFood({
            name: 'Arroz',
            macros: {
                calories: 100,
                protein: 10,
                carbs: 10,
                fat: 10,
            }
        });
        fetchFoods();
    };

    useEffect( () => {
        fetchFoods();
    }, []);

    return (
        <>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                onClick={addFood}
            >
                Adicionar item
            </button>

            {
                foods.map((food, idx) =>
                    <div key={idx}> {food?.name} </div>
                )
            }
        </>
    )
}