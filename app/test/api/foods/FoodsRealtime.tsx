"use client";

export const revalidate = 0;

import { createFood, listFoods } from "@/controllers/food";
import { FoodData } from "@/model/foodModel";
import { Record } from "pocketbase";
import { useEffect, useState } from "react";
import { mockItem } from "../../(mock)/mockItemData";
import MealItem from "@/app/MealItem";

export default function FoodsRealtime(
    { initialFoods }: { initialFoods: (Record & FoodData)[] }
) {
    const [foods, setFoods] = useState(initialFoods);

    // const addFood = () => {
    //     console.log('addFood')
    //     createFood({
    //         name: 'Arroz',
    //         tbcaId: Math.random().toString(),
    //         components: {
    //             'Proteína': ['10', 'g'],
    //             'Carboidrato total': ['20', 'g'],
    //             'Lipídios': ['30', 'g'],
    //         }
    //     });
        
    //     // console.log('food added', record)
    // }

    // const fetchFoods = async () => {
    //     const foods = await listFoods();
    //     setFoods(foods);
    // }

    return (
        <>
            {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                onClick={addFood}
            >
                Adicionar item
            </button>

            {
                foods.length > 0 &&
                <div className="mt-3">
                    <MealItem {...mockItem} food={{ ...mockItem.food, name: foods[foods.length-1].name }} quantity={100} />
                </div>
                || <div className="mt-3">Nenhum item adicionado</div>
            }    */}

            {/* {
                foods.map((food) =>
                    <div key={food.tbcaId} className="mt-3">
                        <MealItem {...mockItem} food={{ ...mockItem.food, name: food.name }} quantity={100} />
                    </div>
                )
            } */}
        </>
    )
}