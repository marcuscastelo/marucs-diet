"use client"

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

const CARBO_CALORIES = 4 as const;
const PROTEIN_CALORIES = 4 as const;
const FAT_CALORIES = 9 as const;

export type MacroProfile = {
    gramsPerKgCarbs: number,
    gramsPerKgProtein: number,
    gramsPerKgFat: number,
}

export type TargetGrams = {
    carbs: number,
    protein: number,
    fat: number,
}

export type MacroRepresentation = {
    name: string,
    percentage: number,
    grams: number,
    gramsPerKg: number,
    calorieMultiplier: number,
}

//TODO: retriggered: should not be exported (move to other module)
export const calculateMacroTarget = (
    weight: number,
    savedMacroTarget: MacroProfile
): TargetGrams => ({
    carbs: weight * savedMacroTarget.gramsPerKgCarbs,
    protein: weight * savedMacroTarget.gramsPerKgProtein,
    fat: weight * savedMacroTarget.gramsPerKgFat,
});

//TODO: retriggered: should not be exported (move to other module)
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
    className?: string,
    onSaveProfile: Dispatch<SetStateAction<MacroProfile>>,
};

export default function MacroTarget({
    weight, profile, onSaveProfile: setProfile,
}: MacroTargetProps) {
    const initialGrams = calculateMacroTarget(weight, profile);
    const initialCalories = calculateCalories(initialGrams);
    const [initialCarbsRepr, initialProteinRepr, initialFatRepr] = calculateMacroRepresentation(profile, weight);

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
    }, [profile, weight]);

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
        <>
            <h1 className="text-center text-3xl font-bold mb-6">Meta calórica diária</h1>
            <div className="mx-5">
                <input
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    type="search"
                    id="default-search"
                    className="input input-bordered font-bold text-center"
                    style={{ width: '100%' }}
                    placeholder="Insira a meta de calorias diárias"
                    disabled={true} // TODO: Enable changing target calories directly
                    required
                />

            </div>
            <div className="mx-5 flex flex-col">
                <MacroTargetSetting
                    headerColor="text-green-400"
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
        </>

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

    const percentage = emptyIfZeroElse2Decimals(target.percentage * 100);
    const grams = emptyIfZeroElse2Decimals(target.grams);
    const gramsPerKg = emptyIfZeroElse2Decimals(target.gramsPerKg);

    return (
        <div className="flex flex-col outline outline-slate-900 my-2 p-2">
            <div className="flex-1 block text-center">
                <h1 className={`text-3xl font-bold mt-6 ${headerColor}`}>{target.name}</h1>
                <div className="text-center mt-1">
                    {target.calorieMultiplier * (Number(grams) || 0)} kcal
                </div>
            </div>
            <div className="flex-1 flex-shrink flex flex-col gap-1 mt-5">
                <MacroField
                    fieldName="Porcentagem (%)"
                    field={percentage}
                    setField={(percentage) => onSetPercentage?.(Number(percentage))}
                    unit="%"
                    disabled={true}
                    className="italic font-thin"
                />

                <MacroField
                    fieldName="Gramas (g)"
                    field={grams}
                    setField={(grams) => onSetGrams?.(Number(grams))}
                    unit="g"
                />

                <MacroField
                    fieldName="Proporção (g/kg)"
                    field={gramsPerKg}
                    setField={(gramsPerKg) => onSetGramsPerKg?.(Number(gramsPerKg))}
                    unit="g/kg"
                />
            </div>

        </div>
    );
}

function MacroField({
    fieldName, field, setField, unit, disabled, className
}: {
    fieldName: string,
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
        <div className="flex-1 flex flex-col md:flex-row">
            <div className="md:w-1/3 my-auto text-center md:text-end mr-3">
                <label>{fieldName}</label>
            </div>
            <div className="md:w-2/3">
                <input
                    value={innerField}
                    onChange={(e) => setInnerField(e.target.value)}
                    onBlur={() => setField(innerField)}
                    type="number"
                    // className={`block text-center w-full p-2 pl-10 text-md bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
                    className="input input-bordered font-bold text-center"
                    style={{ width: '100%' }}
                    disabled={disabled}
                    placeholder=""
                    required
                />
            </div>
            {/* <span className="mt-auto">
                {unit}
            </span> */}
        </div>
    );
}