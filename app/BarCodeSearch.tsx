'use client';

import { searchBarCode } from "@/controllers/barcodes";
import { ApiFood } from "@/model/apiFoodModel";
import { useCallback, useEffect, useState } from "react";
import { Food } from "@/model/foodModel";
import MacroNutrients from "./MacroNutrients";
import MealItem from "./MealItem";

export type BarCodeSearchProps = {
    onFoodChange?: (food: ApiFood | null) => void,
}

export default function BarCodeSearch(
    { onFoodChange }: BarCodeSearchProps
) {
    const [loading, setLoading] = useState(false);
    const [barCode, setBarCode] = useState('');
    const [currentApiFood, setCurrentApiFood] = useState<ApiFood | null>(null);

    const EAN_LENGTH = 13;

    useEffect(() => {
        if (barCode.length != EAN_LENGTH) {
            return;
        }

        setLoading(true);
        const promise = searchBarCode(barCode).then((result) => {
            setCurrentApiFood(result);
        }).catch((err) => {
            console.error(err);
            alert(err);
        }).finally(() => {
            setLoading(false);
        });

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 100000);

        return () => {
            clearTimeout(timeout);
        }
    }, [barCode]);


    useEffect(() => {
        onFoodChange?.(currentApiFood);
    }, [currentApiFood, onFoodChange]);
    
    //TODO: converter em outro lugar
    //TODO: parar de usar [qtd, unidade]
    //TODO: multiplicar por 100 o que vier do BarCodeResult
    const food: Omit<Food, 'id'> = {
        source: {
            type: 'api',
            id: currentApiFood?.id?.toString() ?? '',
        },
        name: currentApiFood?.nome ?? '',
        macros: {
            calories: (currentApiFood?.calorias ?? 0) * 100,
            protein: (currentApiFood?.proteinas ?? 0) * 100,
            carbs: (currentApiFood?.carboidratos ?? 0) * 100,
            fat: (currentApiFood?.gordura ?? 0) * 100,
        },
    }

    return (
        <div>
            <h3 className="font-bold text-lg text-white">Busca por código de barras (EAN)</h3>

            <div className="w-full text-center">
                <div className={`loading loading-lg transition-all ${loading ? 'h-80' : 'h-0'}`} />
            </div>

            {currentApiFood && (
                <div className="flex flex-col mt-3">
                    <div className="flex">
                        <div className="flex-1">
                            <p className="font-bold">
                                {currentApiFood.nome}
                            </p>
                            <p className="text-sm">
                                <MealItem mealItem={{
                                    id: Math.random().toString(),
                                    food: {
                                        ...food,
                                        id: 'TODO: criar id'
                                    },
                                    quantity: 100,
                                }}
                                    favorite='hide'
                                />
                                {food.macros.calories ?? '?'} {food.macros.calories ? 'kcal' : ''}
                                {food.macros.carbs ?? '?'} {food.macros.carbs ? 'g' : ''}
                                {food.macros.protein ?? '?'} {food.macros.protein ? 'g' : ''}
                                {food.macros.fat ?? '?'} {food.macros.fat ? 'g' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex mt-3">
                <input
                    type="number" placeholder="Código de barras (Ex: 7891234567890)"
                    className={`mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300`}
                    value={barCode} onChange={(e) => setBarCode(e.target.value.slice(0, 13))}
                />
            </div>
        </div>
    )
}