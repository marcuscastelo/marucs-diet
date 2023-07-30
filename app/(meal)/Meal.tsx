"use client";

import { MealData, mealSchema } from "@/model/mealModel";
import MealItem from "../(mealItem)/MealItem";
import { MealItemData } from "@/model/mealItemModel";
import { MealContextProvider, useMealContext } from "./MealContext";
import { useEffect, useState } from "react";

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
            const parsedMeal = mealSchema.parse(JSON.parse(clipboardText));

            const newMealData = {
                ...mealData,
                items: [
                    ...mealData.items,
                    ...parsedMeal.items,
                ]
            };

            onUpdateMeal(newMealData);
        } catch (e) {
            alert('O conteúdo da área de transferência não é uma refeição válida.');
        }

        // Clear clipboard
        navigator.clipboard
            .writeText('')
    }

    useEffect(() => {
        const interval = setInterval(() => {
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

    const hasValidMealOnClipboard = clipboardText && mealSchema.safeParse(parsedJson).success;

    return (
        <div className="flex">
            <h5 className="text-3xl my-2">{mealData.name}</h5>
            <div className={`ml-auto flex gap-2`}>
                <div
                    className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                    onClick={handleCopyMeal}
                >
                    <CopyIcon />
                </div>
                {
                    hasValidMealOnClipboard &&
                    <div
                        className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                        onClick={handlePasteMeal}
                    >
                        <PasteIcon />
                    </div>
                }
                <div
                    className={`px-2 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                    onClick={onClearItems}
                >
                    <TrashIcon />
                </div>
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

const TrashIcon = () => <svg className="bi bi-trash" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" fill="red"></path> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" fill="red"></path> </svg>
const CopyIcon = () => <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="30" height="30" x="0px" y="0px" viewBox="0 0 115.77 122.88" ><g><path className="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z" fill="white"></path></g></svg>
const PasteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512"><path d="M320 96V80C320 53.49 298.5 32 272 32H215.4C204.3 12.89 183.6 0 160 0S115.7 12.89 104.6 32H48C21.49 32 0 53.49 0 80v320C0 426.5 21.49 448 48 448l144 .0013L192 176C192 131.8 227.8 96 272 96H320zM160 88C146.8 88 136 77.25 136 64S146.8 40 160 40S184 50.75 184 64S173.3 88 160 88zM416 128v96h96L416 128zM384 224L384 128h-112C245.5 128 224 149.5 224 176v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48V256h-95.99C398.4 256 384 241.6 384 224z" fill="white" /></svg>