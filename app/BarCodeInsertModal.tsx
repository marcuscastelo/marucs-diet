'use client';

import { useEffect, useState } from "react";
import { showModal } from "@/utils/DOMModal";
import BarCodeSearch from "./BarCodeSearch";
import { Food } from "@/model/foodModel";

export type BarCodeInsertModalProps = {
    modalId: string,
    show?: boolean,
    onSelect: (apiFood: Food) => void,
}

export default function BarCodeInsertModal({ modalId, show, onSelect }: BarCodeInsertModalProps) {
    const [food, setFood] = useState<Food | null>(null);

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

        if (!food) {
            console.warn('Ignoring submit because apiFood is null');
            return;
        }

        onSelect(food);
    }

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={onSubmit}>
                    <BarCodeSearch onFoodChange={setFood}/>
                    
                    <div className="modal-action">
                        {/* //TODO: make buttons work */}
                        {/* if there is a button in form, it will close the modal */}
                        {/* <button className="btn" onClick={() => onCancel?.()} >Cancelar</button>
                        <button className="btn" disabled={!canAdd} onClick={(e) => {
                            e.preventDefault();
                            onApply(createMealItemData());
                        }} >Aplicar</button> */}
                    </div>
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}


