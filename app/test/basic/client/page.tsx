"use client";

import { createFood, listFoods } from "@/controllers/food";
import { Food } from "@/model/foodModel";
import { useEffect, useState } from "react";

export default function Page() {
    const [foods, setFoods] = useState([{ name: 'test' }] as Food[]);

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    const addFood = async () => {
        console.log('addFood')
        await createFood({
            id: Math.random().toString(),
            name: 'Arroz',
            tbcaId: Math.random().toString(),
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