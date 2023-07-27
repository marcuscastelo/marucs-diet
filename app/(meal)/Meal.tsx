"use client";

import { MealData } from "@/model/mealModel";
import MealItem from "../(mealItem)/MealItem";
import { MealItemData } from "@/model/mealItemModel";
import { MealContextProvider, useMealContext } from "./MealContext";

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

    const onClearItems = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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

    return (
        <div className="flex">
            <h5 className="text-3xl my-2">{mealData.name}</h5>
            <button
                className="btn bg-red-800 px-5 ml-auto text-white"
                onClick={onClearItems}
            >
                Limpar itens
            </button>
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
                                <MealItem.NutritionalInfo/>
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