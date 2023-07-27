'use client';

import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { useUser } from "@/redux/features/userSlice";
import { Progress } from "flowbite-react";
import { calculateMacroTarget } from "./MacroTargets";

export default function DayMacros({ macros, className }: { macros: MacroNutrientsData, className?: string }) {

    macros.calories = macros.calories || (
        macros.carbs * 4 +
        macros.protein * 4 +
        macros.fat * 9
    )

    const { user } = useUser();

    if (user.loading) {
        return <>Loading user...</>;
    }

    const macroProfile = user.data.macroProfile;
    const macroGrams = calculateMacroTarget(user.data.weight, macroProfile);

    const targetCalories = macroGrams.gramsCarbs * 4 + macroGrams.gramsProtein * 4 + macroGrams.gramsFat * 9;
    return (
        <>
            <div className={`flex pt-3 ${className}`}>
                <div className="mt-3 h-28 overflow-y-clip">
                    <div className="radial-progress text-blue-600" style={{
                        "--value": (100 * (macros.calories / targetCalories) / 2), "--size": "12rem", "--thickness": "0.7rem",
                        transform: `rotate(90deg) scale(-1, -1)`,
                    }}>
                        <span 
                        className="text-lg font-semibold"
                        style={{
                            transform: `rotate(-90deg) scale(-1, -1) translate(0, -1.0rem)`
                        }}>
                            {Math.round(macros.calories * 10) / 10} / {Math.round(targetCalories * 10) / 10}
                            <br />
                            <div className="text-center w-full">
                                kcal
                            </div>
                        </span>


                    </div>
                </div>
                <div className="mx-2 w-full">
                    <Progress className="" size="sm" textLabelPosition="outside" color="green" textLabel={`Carbo.  (${Math.round(macros.carbs * 100) / 100}/${Math.round(macroGrams.gramsCarbs * 100) / 100}g)`} labelText={true} progress={100 * macros.carbs / macroGrams.gramsCarbs} />
                    <Progress className="" size="sm" textLabelPosition="outside" color="red" textLabel={`Proteína (${Math.round(macros.protein * 100) / 100}/${Math.round(macroGrams.gramsProtein * 100) / 100}g)`} labelText={true} progress={100 * macros.protein / macroGrams.gramsProtein} />
                    <Progress className="" size="sm" textLabelPosition="outside" color="yellow" textLabel={`Gordura (${Math.round(macros.fat * 100) / 100}/${Math.round(macroGrams.gramsFat * 100) / 100}g)`} labelText={true} progress={100 * macros.fat / macroGrams.gramsFat} />
                </div>
            </div>
        </>
    );
}