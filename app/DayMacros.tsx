'use client';

import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { useUser } from "@/redux/features/userSlice";
import { Progress } from "flowbite-react";
import { calculateMacroTarget } from "./MacroTargets";

export default function DayMacros({ macros, className }: { macros: MacroNutrientsData, className?: string }) {
    const currentUser = useUser();

    if (currentUser.loading) {
        return <>Loading user...</>;
    }

    const macroProfile = currentUser.data.macroProfile;
    const targetMacros = calculateMacroTarget(currentUser.data.weight, macroProfile);
    const targetCalories = targetMacros.carbs * 4 + targetMacros.protein * 4 + targetMacros.fat * 9;

    return (
        <>
            <div className={`flex pt-3 ${className} flex-col xs:flex-row `}>
                <div className="flex-shrink">
                    <Calories className="w-full" macros={macros} targetCalories={targetCalories} />
                </div>
                <div className="flex-1">
                    <Macros className="mt-3 xs:mt-0" macros={macros} targetMacros={targetMacros} />
                </div>
            </div>
        </>
    );
}

function Calories({
    macros,
    targetCalories,
    className
}: {
    macros: MacroNutrientsData,
    targetCalories: number,
    className?: string,
}) {
    macros.calories = macros.calories || (
        macros.carbs * 4 +
        macros.protein * 4 +
        macros.fat * 9
    );
    return (
        <>
            <div className={`h-24 overflow-y-clip text-center ${className}`}>
                <div className="radial-progress text-blue-600" style={{
                    "--value": (100 * (macros.calories / targetCalories) / 2), "--size": "12rem", "--thickness": "0.7rem",
                    transform: `rotate(90deg) scale(-1, -1)`,
                }}>
                    <span style={{
                        transform: `rotate(-90deg) scale(-1, -1) translate(0, -0.5rem)`
                    }}>
                        {Math.round(macros.calories * 100) / 100}/{Math.round(targetCalories * 100) / 100}kcal
                    </span>
                </div>
            </div>
        </>
    );
}

function Macros({
    macros,
    targetMacros,
    className,
}: {
    macros: MacroNutrientsData,
    targetMacros: MacroNutrientsData,
    className?: string
}) {
    return (
        <div className={`mx-2 ${className}`}>
            <Progress className="" size="sm" textLabelPosition="outside" color="green" textLabel={`Carboidrato (${Math.round(macros.carbs * 100) / 100}/${Math.round(targetMacros.carbs * 100) / 100}g)`} labelText={true} progress={100 * macros.carbs / targetMacros.carbs} />
            <Progress className="" size="sm" textLabelPosition="outside" color="red" textLabel={`Proteína (${Math.round(macros.protein * 100) / 100}/${Math.round(targetMacros.protein * 100) / 100}g)`} labelText={true} progress={100 * macros.protein / targetMacros.protein} />
            <Progress className="" size="sm" textLabelPosition="outside" color="yellow" textLabel={`Gordura (${Math.round(macros.fat * 100) / 100}/${Math.round(targetMacros.fat * 100) / 100}g)`} labelText={true} progress={100 * macros.fat / targetMacros.fat} />
        </div>
    );
}