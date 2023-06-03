"use client";

import { MacroNutrientsData } from "@/model/macroNutrientsModel";

export default function MacroNutrients(props: MacroNutrientsData) {
    return (
        <>
            <span className="text-green-400 mr-1"> C: {Math.round(props.carbs * 100) / 100} </span>
            <span className="text-red-700 mr-1"> P: {Math.round(props.protein * 100) / 100} </span>
            <span className="text-orange-400"> G: {Math.round(props.fat * 100) / 100} </span>
        </>
    )
}