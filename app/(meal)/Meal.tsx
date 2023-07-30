"use client";

import { MealData, mealSchema } from "@/model/mealModel";
import MealItem from "../(mealItem)/MealItem";
import { MealItemData, mealItemSchema } from "@/model/mealItemModel";
import { MealContextProvider, useMealContext } from "./MealContext";
import { useEffect, useState } from "react";
import { calculateCalories } from "../MacroTargets";
import TrashIcon from "../(icons)/TrashIcon";
import PasteIcon from "../(icons)/PasteIcon";
import CopyIcon from "../(icons)/CopyIcon";

export type MealProps = {
    mealData: MealData,
    header?: React.ReactNode,
    content?: React.ReactNode,
    actions?: React.ReactNode,
    className?: string,
};

//TODO: move this function
// a little function to help us with reordering the result
const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export default function Meal({ mealData, header, content, actions, className }: MealProps) {
    return (
        <div className={`bg-gray-800 p-3 ${className || ''}`}>
            <MealContextProvider mealData={mealData}>
                {header}
                {content}
                {actions}
            </MealContextProvider>
        </div>
    )
}

Meal.Header = MealHeader;
Meal.Content = MealContent;
Meal.Actions = MealActions;

function MealHeader({ onUpdateMeal }: { onUpdateMeal: (meal: MealData) => void }) {
    const { mealData } = useMealContext();

    // TODO: Create a module to calculate calories and macros
    const itemCalories = (item: MealItemData) => calculateCalories({
        carbs: item.food.macros.carbs * item.quantity / 100,
        protein: item.food.macros.protein * item.quantity / 100,
        fat: item.food.macros.fat * item.quantity / 100,
    })

    // TODO: Show how much of the daily target is this meal (e.g. 30% of daily calories) (maybe in a tooltip) (useContext)s
    const mealCalories = mealData.items.reduce((acc, item) => acc + itemCalories(item), 0);

    const [clipboardText, setClipboardText] = useState('');

    const onClearItems = (e: React.MouseEvent) => {
        e.preventDefault();
        // Confirm
        if (!confirm('Tem certeza que deseja limpar os itens?')) {
            return;
        }

        const newMealData = {
            ...mealData,
            items: [],
        };

        onUpdateMeal(newMealData);
    }

    const handleCopyMeal = (e: React.MouseEvent) => {
        e.preventDefault();

        navigator.clipboard
            .writeText(JSON.stringify(mealData))
    }

    const handlePasteMeal = (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            const parsedMeal = mealSchema.safeParse(JSON.parse(clipboardText));

            if (parsedMeal.success) {
                const newMealData = {
                    ...mealData,
                    items: [
                        ...mealData.items,
                        ...parsedMeal.data.items,
                    ]
                };

                onUpdateMeal(newMealData);

                // Clear clipboard
                navigator.clipboard
                    .writeText('');

                return;
            }

            const parsedMealItem = mealItemSchema.safeParse(JSON.parse(clipboardText));

            if (parsedMealItem.success) {
                const newMealData = {
                    ...mealData,
                    items: [
                        ...mealData.items,
                        parsedMealItem.data,
                    ]
                };

                onUpdateMeal(newMealData);

                // Clear clipboard
                navigator.clipboard
                    .writeText('');

                return;
            }
        } catch (e) {
            alert(`Erro ao colar: ${e}`);
        }

        // Clear clipboard
        navigator.clipboard
            .writeText('')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            //TODO: Uncaught (in promise) DOMException: Document is not focused.
            navigator.clipboard
                .readText()
                .then(
                    (clipText) => (setClipboardText(clipText)),
                );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    let parsedJson = {} as any;
    try {
        parsedJson = JSON.parse(clipboardText);
    } catch (e) {
        // Do nothing
    }

    const hasValidPastableOnClipboard =
        clipboardText && (
            mealSchema.safeParse(parsedJson).success ||
            mealItemSchema.safeParse(parsedJson).success
        );

    return (
        <div className="flex">
            <div className="my-2">
                <h5 className="text-3xl">{mealData.name}</h5>
                <p className="text-gray-400 italic">{mealCalories}kcal</p>
            </div>
            <div className={`ml-auto flex gap-2`}>
                {
                    !hasValidPastableOnClipboard && mealData.items.length > 0 &&
                    <div
                        className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                        onClick={handleCopyMeal}
                    >
                        <CopyIcon />
                    </div>
                }
                {
                    hasValidPastableOnClipboard &&
                    <div
                        className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                        onClick={handlePasteMeal}
                    >
                        <PasteIcon />
                    </div>
                }
                {
                    mealData.items.length > 0 &&
                    <div
                        className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                        onClick={onClearItems}
                    >
                        <TrashIcon />
                    </div>
                }
            </div>
        </div>
    )
}

function MealContent({ onEditItem }: { onEditItem: (item: MealItemData) => void }) {
    const { mealData } = useMealContext();

    return (
        <>
            {
                mealData.items.map((item, index) =>
                    <div key={item.id} className="mt-2">
                        <MealItem
                            mealItem={item}
                            onClick={onEditItem}
                            header={
                                <MealItem.Header
                                    name={<MealItem.Header.Name />}
                                    copyButton={
                                        <MealItem.Header.CopyButton
                                            handleCopyMealItem={item => {
                                                navigator.clipboard
                                                    .writeText(JSON.stringify(item))
                                            }} />
                                    }
                                />
                            }
                            nutritionalInfo={
                                <MealItem.NutritionalInfo />
                            }
                        />
                    </div>
                )
            }
        </>
    )
}

function MealActions({ onNewItem }: { onNewItem: () => void }) {
    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
            onClick={onNewItem}
        >
            Adicionar item
        </button>

    )
}

