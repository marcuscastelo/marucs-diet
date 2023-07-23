'use client';

import { useEffect, useState } from "react";
import { showModal } from "@/utils/DOMModal";
import BarCodeSearch from "./BarCodeSearch";
import { ApiFood } from "@/model/apiFoodModel";
import { Food } from "@/model/foodModel";
import { convertApi2Food, createFood } from "@/controllers/food";

export const showMealItemAddModal = (id: string) => {
    window[id].showModal();
}

export const hideMealItemAddModal = (id: string) => {
    window[id].close();
}

export type BarCodeInsertModalProps = {
    modalId: string,
    show?: boolean,
    onSelect: (apiFood: Food) => void,
}

export default function BarCodeInsertModal({ modalId, show, onSelect }: BarCodeInsertModalProps) {
    const [apiFood, setApiFood] = useState<ApiFood | null>(null);

    useEffect(() => {
        if (!show) {
            return;
        }

        const timeout = setTimeout(() => {
            showModal(window, modalId);
        }, 100);

        return () => {
            clearTimeout(timeout);
        }
    }, [show, modalId]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!apiFood) {
            console.warn('Ignoring submit because apiFood is null');
            return;
        }

        const food = convertApi2Food(apiFood);
        const createdFood = await createFood(food);

        onSelect(createdFood);
    }

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={onSubmit}>
                    <BarCodeSearch onFoodChange={setApiFood}/>
                    
                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        {/* <button className="btn" onClick={() => onCancel?.()} >Cancelar</button>
                        <button className="btn" disabled={!canAdd} onClick={(e) => {
                            e.preventDefault();
                            onApply(createMealItemData());
                        }} >Aplicar</button> */}
                    </div>
                </form>
            </dialog>
        </>
    );
}


