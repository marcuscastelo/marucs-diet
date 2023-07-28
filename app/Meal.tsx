"use client";

import { MealData } from "@/model/mealModel";
import MealItem from "./MealItem";
import { MealItemData } from "@/model/mealItemModel";
import { DragDropContext, Draggable, DropResult, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";

export type MealProps = {
    mealData: MealData,
    onNewItem: () => void,
    onEditItem: (item: MealItemData) => void,
    onUpdateMeal: (meal: MealData) => void,
    className?: string,
    locked?: boolean,
};

//TODO: move this function
// a little function to help us with reordering the result
const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};


export default function Meal({ mealData, onNewItem, onEditItem, onUpdateMeal, className, locked }: MealProps) {
    const onDragEnd = (result: DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        if (locked) {
            alert('Não é possível reordenar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        const items = reorder(
            mealData.items,
            result.source.index,
            result.destination.index,
        ) as MealItemData[];

        const newMealData = {
            ...mealData,
            items,
        };

        onUpdateMeal(newMealData);
    }

    const onClearItems = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (locked) {
            alert('Não é possível limpar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

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

    const handleNewItem = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (locked) {
            alert('Não é possível adicionar itens a uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        onNewItem();
    }

    const handleEditItem = (item: MealItemData) => {
        if (locked) {
            alert('Não é possível editar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        onEditItem(item);
    }

    return (
        <DragDropContext
            onDragEnd={onDragEnd} autoScrollerOptions={{
                startFromPercentage: 0.1,
                maxScrollAtPercentage: 0.01,
            }}>
            <Droppable droppableId={mealData.id}>
                {(droppableProvided, droppableSnapshot) => (
                    <div
                        ref={droppableProvided.innerRef}
                    >
                        <div className={`bg-gray-800 p-3 ${className || ''}`}>
                            <div className="flex">
                                <h5 className="text-3xl my-2">
                                    {mealData.name}
                                    &nbsp;
                                    {locked && <span className="text-red-700">[TRAVADA]</span>}
                                </h5>
                                <button
                                    className={`btn ${locked ? 'bg-gray-500' : 'bg-red-800'} px-5 ml-auto text-white`}
                                    onClick={onClearItems}
                                >
                                    Limpar itens
                                </button>
                            </div>
                            {
                                mealData.items.map((item, index) =>
                                    <div key={item.id} className="mt-2">
                                        <Draggable draggableId={item.id} index={index} shouldRespectForcePress={true}>
                                            {(draggableProvided, draggableSnapshot) => (
                                                <div
                                                    ref={draggableProvided.innerRef}
                                                    {...draggableProvided.draggableProps}
                                                    {...draggableProvided.dragHandleProps}
                                                >
                                                    <MealItem
                                                        mealItem={item}
                                                        onClick={handleEditItem}
                                                        favorite='hide'
                                                    />
                                                </div>)}
                                        </Draggable>

                                    </div>
                                )
                            }
                            {droppableProvided.placeholder}
                            <button
                                className={`${locked ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 min-w-full rounded mt-3`}
                                onClick={handleNewItem}
                            >
                                Adicionar item
                            </button>

                        </div>
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}