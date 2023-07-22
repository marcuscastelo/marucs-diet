'use client';

import MealItemAddModal from "@/app/MealItemAddModal";
import { mockItem, mockMeal } from "../(mock)/mockData";
import { showModal } from "@/utils/DOMModal";

export default function Page() {
    const modalId = 'testmodal';
    return (
        <>
            <button className="btn" onClick={() => showModal(window, modalId)}>Show modal</button>
            <MealItemAddModal
                modalId={modalId}
                show={true}
                meal={mockMeal()}
                itemData={mockItem()}
                onApply={() => alert('apply')}
            />
        </>
    )
}