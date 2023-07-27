'use client';

import { useEffect, useState } from "react";
import { showModal } from "@/utils/DOMModal";
import BarCodeSearch from "./BarCodeSearch";
import { Food } from "@/model/foodModel";
import Modal from "./(modals)/modal";

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
        <Modal
            modalId={modalId}
            show={show}
            onSubmit={onSubmit}
            header={<h1 className="modal-title">Pesquisar por código de barras</h1>}
            body={<BarCodeSearch onFoodChange={setFood} />}
            actions={<>

            </>}
        
        />
    );
}


