'use client';

import MealItemAddModal from "@/app/MealItemAddModal";
import { mockItem, mockMeal } from "../(mock)/mockData";
import { ModalRef } from "@/app/(modals)/modal";
import { useRef } from "react";

export default function Page() {
    const modalId = 'testmodal';

    const mealItemAddModalRef = useRef<ModalRef>(null);

    return (
        <>
            <button className="btn" onClick={() => mealItemAddModalRef.current?.showModal()}>
                Show modal
            </button>

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