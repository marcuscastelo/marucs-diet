'use client';

import MealItemAddModal, { showMealItemAddModal } from "@/app/MealItemAddModal";

export default function Page() {
    const modalId = 'testmodal';
    return (
        <>
            <button className="btn" onClick={() => showMealItemAddModal(modalId)}>Show modal</button>
            <MealItemAddModal modalId={modalId} show={true} />
        </>
    )
}