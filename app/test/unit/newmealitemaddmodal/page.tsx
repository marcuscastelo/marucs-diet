'use client';

import MealItemAddModal, { showModal } from "@/app/MealItemAddModal";

export default function Page() {
    const modalId = 'testmodal';
    return (
        <>
            <button className="btn" onClick={() => showModal(modalId)}>Show modal</button>
            <MealItemAddModal modalId={modalId} show={true} />
        </>
    )
}