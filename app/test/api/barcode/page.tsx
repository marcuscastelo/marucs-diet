/* eslint-disable @next/next/no-img-element */
"use client";

import { searchBarCode } from "@/controllers/barcodes";
import { NewFoodData } from "@/model/newFoodModel";
import { useEffect, useState } from "react";
import { Food } from "@/model/foodModel";

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [barCode, setBarCode] = useState('');
    const [currentResult, setCurrentResult] = useState<NewFoodData | null>(null);

    useEffect(() => {
        if (barCode.length != 13) {
            return;
        }

        setLoading(true);     
        const promise = searchBarCode(barCode).then((result) => {
            setCurrentResult(result);
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


    //TODO: converter em outro lugar
    //TODO: parar de usar [qtd, unidade]
    //TODO: multiplicar por 100 o que vier do BarCodeResult
    const food: Food = {
        id: '',
        tbcaId: '', // TODO: FoodData should not require tbcaId
        name: currentResult?.nome ?? '',
        macros: {
            calories: currentResult?.calorias ?? 0,
            protein: currentResult?.proteinas ?? 0,
            carbs: currentResult?.carboidratos ?? 0,
            fat: currentResult?.gordura ?? 0,
        },
    }

    return (
        <div>
            <h3 className="font-bold text-lg text-white">Busca por código de barras (EAN)</h3>

            <div className="w-full text-center">
                <div className={`loading loading-lg transition-all ${loading ? 'h-80' : 'h-0'}`} />
            </div>

            {currentResult && (
                <div className="flex flex-col mt-3">
                    <div className="flex">
                        <div className="flex-1">
                            <p className="font-bold">
                                {currentResult.nome}
                            </p>
                            <p className="text-sm">
                                {food.macros.calories ?? '?'} {food.macros.calories ? 'kcal' : ''}
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