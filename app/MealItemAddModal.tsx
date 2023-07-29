'use client';

import { useEffect, useRef, useState } from "react";
import MealItem from "./(mealItem)/MealItem";
import { MealItemData } from "@/model/mealItemModel";
import { Food } from "@/model/foodModel";
import { MealData } from "@/model/mealModel";
import { hideModal, showModal } from "@/utils/DOMModal";
import { useFavoriteFoods } from "@/redux/features/userSlice";
import Modal from "./(modals)/modal";

export type MealItemAddModalProps = {
    modalId: string,
    meal: MealData,
    itemData: Partial<MealItemData> & { food: Food },
    show?: boolean,
    onApply: (item: MealItemData) => void,
    onCancel?: () => void,
    onDelete?: (itemId: MealItemData['id']) => void,
}

export default function MealItemAddModal({
    modalId, show: initialShow, meal, itemData: { food, quantity: initialQuantity, id: initialId },
    onApply, onCancel, onDelete
}: MealItemAddModalProps
) {
    const [show, setShow] = useState(initialShow ?? false);
    const [quantity, setQuantity] = useState(initialQuantity?.toString() ?? '');
    const [id, setId] = useState(initialId ?? Math.random());
    const canAdd = quantity != '' && Number(quantity) > 0;
    const quantityRef = useRef<HTMLInputElement>(null);

    const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(true);

    const { isFoodFavorite, setFoodAsFavorite } = useFavoriteFoods();

    useEffect(() => {
        if (!show) {
            hideModal(window, modalId);
        } else {
            setQuantity('');
            setId(Math.random());
            setQuantityFieldDisabled(true);
        }

        const timeout = setTimeout(() => {
            setQuantityFieldDisabled(false);
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
            <Modal
                modalId={modalId}
                show={show}
                onSubmit={() => onApply(createMealItemData())}
                header={
                    <h3 className="font-bold text-lg text-white">Novo item em
                        <span className="text-green-500"> &quot;{meal.name}&quot; </span>
                    </h3>
                }
                body={<>
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
                    <div className="flex w-full mt-3 justify-between gap-1">
                        <div className="flex-1 flex my-1 justify-around">
                            <input
                                style={{ width: '100%' }}
                                disabled={quantityFieldDisabled}
                                value={quantity}
                                ref={quantityRef}
                                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/, ''))}
                                type="number" placeholder="Quantidade (gramas)"
                                className={`mt-1  input input-bordered  bg-gray-800 border-gray-300 ${!canAdd ? 'input-error border-red-500' : ''}`} 
                            />
                        </div>
                        <div className="flex-shrink flex ml-1 my-1 justify-around gap-1">
                            <div className="btn btn-xs btn-primary w-10 px-6 h-full text-4xl text-red-600"
                                onClick={decrement}
                                onMouseDown={() => holdRepeatStart(decrement)} onMouseUp={holdRepeatStop}
                                onTouchStart={() => holdRepeatStart(decrement)} onTouchEnd={holdRepeatStop}
                            > - </div>
                            <div className="ml-1 btn btn-xs btn-primary w-10 px-6 h-full text-4xl text-green-400"
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
                        header={
                            <MealItem.Header
                                name={<MealItem.Header.Name />}
                                favorite={
                                    <MealItem.Header.Favorite
                                        favorite={isFoodFavorite(food.id)}
                                        setFavorite={(favorite) => setFoodAsFavorite(food.id, favorite)}
                                    />
                                }
                            />
                        }
                        nutritionalInfo={
                            <MealItem.NutritionalInfo />
                        }
                    />
                </>}
                actions={<Modal.Actions>
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
                            hideModal(window, modalId); //TODO: retriggered: remove this and use react state
                            onCancel?.()
                        }} >
                            Cancelar
                        </button>
                    <button className="btn" disabled={!canAdd} onClick={(e) => {
                        e.preventDefault();
                        onApply(createMealItemData());
                    }} >Aplicar</button>
                </Modal.Actions>}
            />
        </>
    );
}


