'use client';

import { useEffect, useState } from "react";
import { hideModal, showModal } from "@/utils/DOMModal";
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

    const handleSelect = async (e?: React.SyntheticEvent) => {
        e?.preventDefault();

        if (!food) {
            console.warn('Ignoring submit because apiFood is null');
            return;
        }

        onSelect(food);
    }

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={handleSelect}>
                    <BarCodeSearch onFoodChange={setFood} />

                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn" onClick={(e) => {
                            e.preventDefault();
                            hideModal(window, modalId); // TODO: retriggered: remove this and use state/modal component
                        }} >
                            Cancelar
                        </button>
                        <button className="btn btn-primary" disabled={!food} onClick={handleSelect} >Aplicar</button>
                    </div>
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}


