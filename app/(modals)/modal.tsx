'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { BarCodeReader } from "../BarCodeReader";
import Show from "../Show";

export type ModalProps = {
    modalId: string,
    header?: React.ReactNode,
    body?: React.ReactNode,
    actions?: React.ReactNode,
    hasBackdrop?: boolean,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
    onVisibilityChange?: (isShowing: boolean) => void,
};

export type ModalRef = {
    showModal: () => void,
    close: () => void,
};

//eslint-disable-next-line react/display-name
const Modal = forwardRef((
    {
        modalId,
        header,
        body,
        actions,
        hasBackdrop = true,
        onSubmit,
        onVisibilityChange,
    }: ModalProps,
    ref: React.Ref<ModalRef>
) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const [showing, setShowing] = useState(false);

    const handleVisibilityChange = (isShowing: boolean) => {
        setShowing(isShowing);
        onVisibilityChange?.(isShowing);
    };

    useImperativeHandle(ref, () => ({
        showModal: () => {
            innerRef.current?.showModal();
            handleVisibilityChange(innerRef.current?.open === true);
        },
        close: () => {
            innerRef.current?.close();
            handleVisibilityChange(innerRef.current?.open === true);
        },
    }));

    return (
        <dialog id={modalId} className="modal modal-bottom sm:modal-middle" ref={innerRef}>

            {/* TODO: className deveria estar no forms? */}
            <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={onSubmit}>
                {header}
                {body}
                {actions}
            </form>
            {
                hasBackdrop && (
                    <form method="dialog" className="modal-backdrop">
                        <button
                            onClick={() => onVisibilityChange?.(false)}
                        >
                            close
                        </button>
                    </form>
                )
            }
        </dialog>
    );
});

//TODO: ModalHeader => Modal.Header, ModalBody => Modal.Body, ModalActions => Modal.Actions
export function ModalHeader() {
    return (
        <h3 className="font-bold text-lg text-white">Novo item em
            <span className="text-green-500"> &quot;TEST&quot; </span>
        </h3>
    );
}

export function ModalBody() {

}

export function ModalActions({ children }: { children: React.ReactNode }) {
    return (
        <div className="modal-action">
            {children}
        </div>
    );
}

export default Modal;