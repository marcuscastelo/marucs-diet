'use client';

import { useEffect, useState } from "react";
import MealItem from "./MealItem";
import { mockFood } from "./test/unit/(mock)/mockData";
import { MealItemData } from "@/model/mealItemModel";
import { FoodData } from "@/model/foodModel";
import { MealData } from "@/model/mealModel";
import { showModal } from "@/utils/DOMModal";

export const showMealItemAddModal = (id: string) => {
    window[id].showModal();
}

export const hideMealItemAddModal = (id: string) => {
    window[id].close();
}

export type BarCodeInsertModalProps = {
    modalId: string,
    show?: boolean,
    onSelect: (barCode: string) => void,
}

export default function BarCodeInsertModal({ modalId, show, onSelect }: BarCodeInsertModalProps) {

    const [loading, setLoading] = useState(false);
    const [barCode, setBarCode] = useState('');

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

    useEffect(() => {
        if (barCode.length != 13) {
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }

    }, [barCode]);

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={() => onSelect('mock123')}>
                    <h3 className="font-bold text-lg text-white">Busca por código de barras (EAN)</h3>

                    <div className="w-full text-center">
                        <div className={`loading loading-lg transition-all ${loading ? 'h-80' : 'h-0'}`} />
                    </div>

                    <div className="flex mt-3">
                        <input
                            type="number" placeholder="Código de barras (Ex: 7891234567890)"
                            className={`mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300`}
                            value={barCode} onChange={(e) => setBarCode(e.target.value.slice(0, 13))}
                        />

                    </div>

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


