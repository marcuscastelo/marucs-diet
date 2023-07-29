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

    const onClearItems = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e?.preventDefault();

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
                            <div className="flex flex-col 2xs:flex-row">
                                <h5 className="text-3xl my-2">
                                    {mealData.name}
                                    &nbsp;
                                    {locked && <span className="text-red-700">[TRAVADA]</span>}
                                </h5>
                                <div
                                    className={`${locked ? 'text-gray-500' : 'text-red-600'} px-5 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
                                    onClick={_ => onClearItems()}
                                >
                                    <TrashIcon/>
                                </div>
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

const TrashIcon = () => <svg className="bi bi-trash" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" fill="red"></path> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" fill="red"></path> </svg>