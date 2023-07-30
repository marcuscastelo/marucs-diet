'use client';

import { hideModal, showModal } from "@/utils/DOMModal";
import { useEffect, useState } from "react";

export type ModalProps = {
    modalId: string,
    show?: boolean,
    header?: React.ReactNode,
    body?: React.ReactNode,
    actions?: React.ReactNode,
    hasBackdrop?: boolean,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
};

export default function Modal({
    modalId,
    show: wantToShow,
    header,
    body,
    actions,
    hasBackdrop = true,
    onSubmit,
}: ModalProps) {
    const [show, setShow] = useState(wantToShow ?? false);

    useEffect(() => {
        if (wantToShow === undefined) {
            return;
        }

        setShow(wantToShow);
    }, [wantToShow]);
    
    useEffect(() => {
        if (!show) {
            hideModal(window, modalId);
            return;
        }

        const timeout = setTimeout(() => {
            showModal(window, modalId);
        }, 100);

        return () => {
            clearTimeout(timeout);
        }
    }, [show, modalId]);



    return (
        <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
            {/* TODO: className deveria estar no forms? */}
            <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={onSubmit}>
                {header}
                {body}
                {actions}
            </form>
            {
                hasBackdrop && (
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                )
            }
        </dialog>
    );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Actions = ModalActions;

function ModalHeader() {
    return (
        <h3 className="font-bold text-lg text-white">Novo item em
            <span className="text-green-500"> &quot;TEST&quot; </span>
        </h3>
    );
}

function ModalBody() {

}

function ModalActions({ children }: { children: React.ReactNode }) {
    return (
        <div className="modal-action">
            {children}
        </div>
    );
}