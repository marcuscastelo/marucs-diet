'use client';

import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { Progress } from "flowbite-react";

export default function DayMacros({ macros, className }: { macros: MacroNutrientsData, className?: string }) {
    const targetMacros = {
        carbs: 136,
        protein: 184,
        fat: 80,
    };

    macros.calories = macros.calories || (
        macros.carbs * 4 +
        macros.protein * 4 +
        macros.fat * 9
    )

    const targetCalories = targetMacros.carbs * 4 + targetMacros.protein * 4 + targetMacros.fat * 9;
    return (
        <>
            <div className={`flex pt-3 ${className}`}>
                <div className="h-24 overflow-y-clip">
                    <div className="radial-progress text-blue-600" style={{
                        "--value": (100 * (macros.calories / targetCalories) / 2), "--size": "12rem", "--thickness": "0.7rem",
                        transform: `rotate(90deg) scale(-1, -1)`,
                    }}>
                        <span style={{
                            transform: `rotate(-90deg) scale(-1, -1) translate(0, -0.5rem)`
                        }}>
                            {macros.calories}/{targetCalories}kcal
                        </span>
                    </div>
                </div>
                <div className="mx-2 w-full">
                    <Progress className="" size="sm" textLabelPosition="outside" color="green" textLabel={`Carboidrato (${macros.carbs}/${targetMacros.carbs}g)`} labelText={true} progress={100 * macros.carbs / targetMacros.carbs} />
                    <Progress className="" size="sm" textLabelPosition="outside" color="red" textLabel={`Proteína (${macros.protein}/${targetMacros.protein}g)`} labelText={true} progress={100 * macros.protein / targetMacros.protein} />
                    <Progress className="" size="sm" textLabelPosition="outside" color="yellow" textLabel={`Gordura (${macros.fat}/${targetMacros.fat}g)`} labelText={true} progress={100 * macros.fat / targetMacros.fat} />
                </div>
            </div>
        </>
    );
}