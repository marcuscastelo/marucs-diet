'use client';

import { useEffect, useState } from "react";
import MealItem from "./MealItem";
import { mockFood } from "./test/unit/(mock)/mockData";
import { MealItemData } from "@/model/mealItemModel";
import { FoodData } from "@/model/foodModel";
import { MealData } from "@/model/mealModel";

export const showMealItemAddModal = (id: string) => {
    window[id].showModal();
}

export type MealItemAddModalProps = {
    modalId: string,
    show?: boolean,
    meal: MealData,
    food: FoodData,
    onAdd: (food: MealItemData) => void,
    onCancel?: () => void,
}

export default function MealItemAddModal({ modalId, show, meal, food, onAdd, onCancel }: MealItemAddModalProps) {
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (!show) {
            return;
        }

        const timeout = setTimeout(() => {
            showMealItemAddModal(modalId);
        }, 100);

        return () => {
            clearTimeout(timeout);
        }
    }, [show, modalId]);

    const increment = () => setQuantity((old) => (Number(old ?? '0') + 1).toString())
    const decrement = () => setQuantity((old) => Math.max(0, Number(old ?? '0') - 1).toString())

    const [currentHoldTimeout, setCurrentHoldTimeout] = useState(undefined as NodeJS.Timeout | undefined);
    const [currentHoldInterval, setCurrentHoldInterval] = useState(undefined as NodeJS.Timeout | undefined);

    const holdRepeatStart = (action: () => void) => {
        setCurrentHoldTimeout(setTimeout(() => {
            setCurrentHoldInterval(setInterval(() => {
                action();
            }, 100));
        }, 500));
    }

    const holdRepeatStop = () => {
        if (currentHoldTimeout) {
            clearTimeout(currentHoldTimeout);
        }

        if (currentHoldInterval) {
            clearInterval(currentHoldInterval);
        }
    }

    const createMealItem = () => ({
        quantity: Number(quantity),
        food: food,
    });

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white">
                    <h3 className="font-bold text-lg text-white">Novo item em
                        <span className="text-green-500"> &quot;{meal.name}&quot; </span>
                    </h3>

                    <p className="text-gray-400 mt-1">Atalhos</p>
                    <div className="flex w-full mt-1">
                        <div className="btn btn-sm btn-primary flex-1" onClick={() => setQuantity('10')} >10g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('20')} >20g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('30')} >30g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('40')} >40g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('50')} >50g</div>
                    </div>
                    <div className="flex w-full mt-1">
                        <div className="btn btn-sm btn-primary flex-1" onClick={() => setQuantity('100')} >100g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('150')} >150g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('200')} >200g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('250')} >250g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('300')} >300g</div>
                    </div>
                    <div className="flex mt-3">
                        <input
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/, ''))}
                            type="number" placeholder="Quantidade (gramas)"
                            className="mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300" />
                        <div className="w-20 flex ml-1 my-1">
                            <div className="btn btn-xs btn-primary w-10 h-full text-4xl text-red-600"
                                onClick={decrement}
                                onMouseDown={() => holdRepeatStart(decrement)} onMouseUp={holdRepeatStop}
                                onTouchStart={() => holdRepeatStart(decrement)} onTouchEnd={holdRepeatStop}
                            > - </div>
                            <div className="ml-1 btn btn-xs btn-primary w-10 h-full text-4xl text-green-400"
                                onClick={increment}
                                onMouseDown={() => holdRepeatStart(increment)} onMouseUp={holdRepeatStop}
                                onTouchStart={() => holdRepeatStart(increment)} onTouchEnd={holdRepeatStop}
                            > + </div>
                        </div>
                    </div>

                    <MealItem
                        className="mt-4"
                        food={food}
                        quantity={Number(quantity)}
                    />

                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn" onClick={() => onCancel?.()} >Cancelar</button>
                        <button className="btn" onClick={(e) => {
                            e.preventDefault();
                            onAdd(createMealItem());
                        }} >Adicionar</button>
                    </div>
                </form>
            </dialog>
        </>
    );
}


