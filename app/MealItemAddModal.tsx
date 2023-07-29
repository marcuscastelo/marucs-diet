'use client';

import { useEffect, useRef, useState } from "react";
import MealItem from "./MealItem";
import { mockFood } from "./test/unit/(mock)/mockData";
import { MealItemData } from "@/model/mealItemModel";
import { Food } from "@/model/foodModel";
import { MealData } from "@/model/mealModel";
import { hideModal, showModal } from "@/utils/DOMModal";
import { setFoodAsFavorite, useIsFoodFavorite } from "@/redux/features/userSlice";
import { useAppDispatch } from "@/redux/hooks";

export type MealItemAddModalProps = {
    modalId: string,
    meal: MealData,
    itemData: Partial<MealItemData> & { food: Food },
    show?: boolean,
    onApply: (item: MealItemData) => void,
    onCancel?: () => void,
    onDelete?: (itemId: string) => void,
}

export default function MealItemAddModal({
    modalId, show: initialShow, meal, itemData: { food, quantity: initialQuantity, id: initialId },
    onApply, onCancel, onDelete
}: MealItemAddModalProps
) {
    const [show, setShow] = useState(initialShow ?? false);
    const [quantity, setQuantity] = useState(initialQuantity?.toString() ?? '');
    const [id, setId] = useState(initialId ?? Math.random().toString());
    const canAdd = quantity != '' && Number(quantity) > 0;
    const quantityRef = useRef<HTMLInputElement>(null);

    const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(true);

    const isFoodFavorite = useIsFoodFavorite();
    const dispatch = useAppDispatch();

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

    useEffect(() => {
        if (initialQuantity !== undefined) {
            setQuantity(initialQuantity.toString());
        }

        if (initialId !== undefined) {
            setId(initialId);
        }
    }, [initialQuantity, initialId]);

    useEffect(() => {
        setQuantityFieldDisabled(true);
        setTimeout(() => {
            setQuantityFieldDisabled(false);
        }, 1000);
    }, [initialQuantity, initialId]);

    const increment = () => setQuantity((old) => (Number(old ?? '0') + 1).toString())
    const decrement = () => setQuantity((old) => Math.max(0, Number(old ?? '0') - 1).toString())

    const [currentHoldTimeout, setCurrentHoldTimeout] = useState<NodeJS.Timeout>();
    const [currentHoldInterval, setCurrentHoldInterval] = useState<NodeJS.Timeout>();

    const holdRepeatStart = (action: () => void) => {
        setCurrentHoldTimeout(setTimeout(() => {
            setCurrentHoldInterval(setInterval(() => {
                action();
            }, 100));
        }, 500));
    }

    const holdRepeatStop = () => {
        if (currentHoldTimeout) {
            clearTimeout(currentHoldTimeout);
        }

        if (currentHoldInterval) {
            clearInterval(currentHoldInterval);
        }
    }

    const createMealItemData = (): MealItemData => ({
        id,
        quantity: Number(quantity),
        food
    });

    return (
        <>
            <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box bg-gray-800 text-white" onSubmit={() => onApply(createMealItemData())}>
                    <h3 className="font-bold text-lg text-white">Novo item em
                        <span className="text-green-500"> &quot;{meal.name}&quot; </span>
                    </h3>

                    <p className="text-gray-400 mt-1">Atalhos</p>
                    <div className="flex w-full mt-1">
                        <div className="btn btn-sm btn-primary flex-1" onClick={() => setQuantity('10')} >10g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('20')} >20g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('30')} >30g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('40')} >40g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('50')} >50g</div>
                    </div>
                    <div className="flex w-full mt-1">
                        <div className="btn btn-sm btn-primary flex-1" onClick={() => setQuantity('100')} >100g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('150')} >150g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('200')} >200g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('250')} >250g</div>
                        <div className="ml-1 btn btn-sm btn-primary flex-1" onClick={() => setQuantity('300')} >300g</div>
                    </div>
                    <div className="flex mt-3">
                        <input
                            disabled={quantityFieldDisabled}
                            value={quantity}
                            ref={quantityRef}
                            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/, ''))}
                            type="number" placeholder="Quantidade (gramas)"
                            className={`mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300 ${!canAdd ? 'input-error border-red-500' : ''}`} />
                        <div className="w-20 flex ml-1 my-1">
                            <div className="btn btn-xs btn-primary w-10 h-full text-4xl text-red-600"
                                onClick={decrement}
                                onMouseDown={() => holdRepeatStart(decrement)} onMouseUp={holdRepeatStop}
                                onTouchStart={() => holdRepeatStart(decrement)} onTouchEnd={holdRepeatStop}
                            > - </div>
                            <div className="ml-1 btn btn-xs btn-primary w-10 h-full text-4xl text-green-400"
                                onClick={increment}
                                onMouseDown={() => holdRepeatStart(increment)} onMouseUp={holdRepeatStop}
                                onTouchStart={() => holdRepeatStart(increment)} onTouchEnd={holdRepeatStop}
                            > + </div>
                        </div>
                    </div>

                    <MealItem
                        mealItem={{
                            id,
                            food,
                            quantity: Number(quantity),
                        }}
                        className="mt-4"
                        favorite={
                            isFoodFavorite(food.id)
                        }
                        setFavorite={(favorite) => {
                            dispatch(setFoodAsFavorite({
                                foodId: food.id,
                                favorite
                            }));
                        }}
                    />

                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        {
                            onDelete &&
                            <button className="btn btn-error mr-auto" onClick={(e) => {
                                if (confirm('Tem certeza que deseja excluir este item?')) {
                                    e.preventDefault();
                                    onDelete?.(id);
                                }
                            }} >Excluir</button>
                        }
                        <button className="btn" onClick={(e) => {
                            e.preventDefault();
                            setShow(false);
                            hideModal(window, modalId); //TODO: remove this and use react state
                            onCancel?.()
                        }} >
                            Cancelar
                        </button>
                        <button className="btn" disabled={!canAdd} onClick={(e) => {
                            e.preventDefault();
                            onApply(createMealItemData());
                        }} >Aplicar</button>
                    </div>
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}


