"use client"

import { useCallback, useEffect, useState } from "react";

const CARBO_CALORIES = 4 as const;
const PROTEIN_CALORIES = 4 as const;
const FAT_CALORIES = 9 as const;

type MacroProfile = {
    gramsPerKgCarbs: number,
    gramsPerKgProtein: number,
    gramsPerKgFat: number,
}

type TargetGrams = {
    carbs: number,
    protein: number,
    fat: number,
}

type MacroRepresentation = {
    name: string,
    percentage: number,
    grams: number,
    gramsPerKg: number,
    calorieMultiplier: number,
}

//TODO: should not be exported (move to other module)
export const calculateMacroTarget = (
    weight: number,
    savedMacroTarget: MacroProfile
): TargetGrams => ({
    carbs: weight * savedMacroTarget.gramsPerKgCarbs,
    protein: weight * savedMacroTarget.gramsPerKgProtein,
    fat: weight * savedMacroTarget.gramsPerKgFat,
});

//TODO: should not be exported (move to other module)
export const calculateCalories = (targetGrams: TargetGrams): number => (
    targetGrams.carbs * 4 + targetGrams.protein * 4 + targetGrams.fat * 9
);

const calculateMacroRepresentation = (profile: MacroProfile, weight: number): MacroRepresentation[] => {
    const targetGrams = calculateMacroTarget(weight, profile);
    const calories = calculateCalories(targetGrams);

    return [
        {
            name: 'Carboidratos',
            percentage: targetGrams.carbs * 4 / calories,
            grams: targetGrams.carbs,
            gramsPerKg: profile.gramsPerKgCarbs,
            calorieMultiplier: CARBO_CALORIES,
        },
        {
            name: 'Proteínas',
            percentage: targetGrams.protein * 4 / calories,
            grams: targetGrams.protein,
            gramsPerKg: profile.gramsPerKgProtein,
            calorieMultiplier: PROTEIN_CALORIES,
        },
        {
            name: 'Gorduras',
            percentage: targetGrams.fat * 9 / calories,
            grams: targetGrams.fat,
            gramsPerKg: profile.gramsPerKgFat,
            calorieMultiplier: FAT_CALORIES,
        },
    ];
};

const calculateDifferenceInCarbs = (targetCalories: number, weight: number, currentProfile: MacroProfile): number => {
    const currentCalories = calculateCalories(calculateMacroTarget(weight, currentProfile));
    return (targetCalories - currentCalories) / CARBO_CALORIES;
}

export type MacroTargetProps = {
    weight: number,
    profile: MacroProfile,
    onSetProfile: (profile: MacroProfile) => void,
};

export default function MacroTarget({
    weight, profile: initialProfile, onSetProfile
}: MacroTargetProps) {
    const initialGrams = calculateMacroTarget(weight, initialProfile);
    const initialCalories = calculateCalories(initialGrams);
    const [initialCarbsRepr, initialProteinRepr, initialFatRepr] = calculateMacroRepresentation(initialProfile, weight);

    const [profile, setProfile] = useState(initialProfile);
    const [targetCalories, setTargetCalories] = useState(initialCalories.toString());

    const [carbsRepr, setCarbsRepr] = useState<MacroRepresentation>(initialCarbsRepr);
    const [proteinRepr, setProteinRepr] = useState<MacroRepresentation>(initialProteinRepr);
    const [fatRepr, setFatRepr] = useState<MacroRepresentation>(initialFatRepr);

    useEffect(() => {
        const [carbsRepr, proteinRepr, fatRepr] = calculateMacroRepresentation(profile, weight);
        setCarbsRepr(carbsRepr);
        setProteinRepr(proteinRepr);
        setFatRepr(fatRepr);

        const targetCalories = calculateCalories(calculateMacroTarget(weight, profile));
        setTargetCalories(targetCalories.toString());
        onSetProfile(profile);
    }, [profile, weight, onSetProfile]);

    const makeOnSetGramsPerKg = (macro: 'carbs' | 'protein' | 'fat') =>
        (gramsPerKg: number) =>
            setProfile(profile => ({
                ...profile,
                [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]: gramsPerKg,
            }));

    const makeOnSetGrams = (macro: 'carbs' | 'protein' | 'fat') =>
        (grams: number) =>
            setProfile(profile => ({
                ...profile,
                [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]: grams / weight,
            }));

    const makeOnSetPercentage = (macro: 'carbs' | 'protein' | 'fat') => (percentage: number) => {
        alert('TODO: future feature');
    };


    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-center text-3xl font-bold mb-6">Meta calórica diária</h1>
            <input
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                type="search"
                id="default-search"
                className="block text-center w-full p-2 pl-10 text-md bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 italic font-thin"
                placeholder="Insira a meta de calorias diárias"
                disabled={true} // TODO: future feature
                required
            />

            <MacroTargetSetting
                headerColor="text-green-500"
                target={carbsRepr}
                onSetGramsPerKg={makeOnSetGramsPerKg('carbs')}
                onSetGrams={makeOnSetGrams('carbs')}
                onSetPercentage={makeOnSetPercentage('carbs')}
            />

            <MacroTargetSetting
                headerColor="text-red-500"
                target={proteinRepr}
                onSetGramsPerKg={makeOnSetGramsPerKg('protein')}
                onSetGrams={makeOnSetGrams('protein')}
                onSetPercentage={makeOnSetPercentage('protein')}
            />

            <MacroTargetSetting
                headerColor="text-yellow-500"
                target={fatRepr}
                onSetGramsPerKg={makeOnSetGramsPerKg('fat')}
                onSetGrams={makeOnSetGrams('fat')}
                onSetPercentage={makeOnSetPercentage('fat')}
            />
        </div>

    );
}

function MacroTargetSetting(
    {
        headerColor,
        target,
        onSetPercentage,
        onSetGrams,
        onSetGramsPerKg,
    }:
        {
            headerColor: string,
            target: MacroRepresentation,
            onSetPercentage?: (percentage: number) => void,
            onSetGrams?: (grams: number) => void,
            onSetGramsPerKg?: (gramsPerKg: number) => void,
        }
) {
    const emptyIfZeroElse2Decimals = (value: number) => value && value.toFixed(2) || '';

    const percentage = emptyIfZeroElse2Decimals(target.percentage);
    const grams = emptyIfZeroElse2Decimals(target.grams);
    const gramsPerKg = emptyIfZeroElse2Decimals(target.gramsPerKg);

    return (
        <>
            <h1 className={`text-center text-3xl font-bold my-6 ${headerColor}`}>{target.name}</h1>

            <div className="flex gap-10 ">

                <MacroField
                    field={percentage}
                    setField={(percentage) => onSetPercentage?.(Number(percentage))}
                    unit="%"
                    disabled={true}
                    className="italic font-thin"
                />

                <MacroField
                    field={grams}
                    setField={(grams) => onSetGrams?.(Number(grams))}
                    unit="g"
                />

                <MacroField
                    field={gramsPerKg}
                    setField={(gramsPerKg) => onSetGramsPerKg?.(Number(gramsPerKg))}
                    unit="g/kg"
                />
            </div>
            <div className="text-center mt-3">
                {target.calorieMultiplier * (Number(grams) || 0)} kcal 
                {/* RERENDER: {Math.random().toString().slice(0, 5)} */}
            </div>
        </>
    );
}

function MacroField({
    field, setField, unit, disabled, className
}: {
    field: string,
    setField: (field: string) => void,
    unit: string,
    disabled?: boolean,
    className?: string,
}) {
    const [innerField, setInnerField] = useState(field);

    useEffect(() => {
        setInnerField(field);
    }, [field]);

    return (
        <div className="flex flex-1 gap-1">
            <input
                value={innerField}
                onChange={(e) => setInnerField(e.target.value)}
                onBlur={() => setField(innerField)}
                type="number"
                className={`block text-center w-full p-2 pl-10 text-md bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
                disabled={disabled}
                placeholder=""
                required
            />
            <span className="mt-auto">
                {unit}
            </span>
        </div>
    );
}