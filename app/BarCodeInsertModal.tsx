'use client';

import { useEffect, useState } from "react";
import { hideModal, showModal } from "@/utils/DOMModal";
import BarCodeSearch from "./BarCodeSearch";
import { Food } from "@/model/foodModel";
import { BarCodeReader } from "./BarCodeReader";
import Modal from "./(modals)/modal";

export type BarCodeInsertModalProps = {
    modalId: string,
    show?: boolean,
    onSelect: (apiFood: Food) => void,
}

export default function BarCodeInsertModal({ modalId, show, onSelect }: BarCodeInsertModalProps) {
    const [barCode, setBarCode] = useState<string>('');
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
        <Modal
            modalId={modalId}
            show={show}
            onSubmit={onSubmit}
            header={<h1 className="modal-title">Pesquisar por código de barras</h1>}
            body={<>
                <BarCodeReader id="reader" onScanned={setBarCode} />
                <BarCodeSearch
                    barCode={barCode}
                    setBarCode={setBarCode}
                    onFoodChange={setFood}
                />
            </>}
            actions={<Modal.Actions>
                <button className="btn" onClick={(e) => {
                    e.preventDefault();
                    hideModal(window, modalId); // TODO: retriggered: remove this and use state/modal component
                }} >
                    Cancelar
                </button>
                <button className="btn btn-primary" disabled={!food} onClick={handleSelect} >Aplicar</button>
            </Modal.Actions>}

        />
    );
}


