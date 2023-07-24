'use client';

import { searchBarCode } from "@/controllers/barcodes";
import { ApiFood } from "@/model/apiFoodModel";
import { useEffect, useState } from "react";
import MealItem from "./MealItem";
import { convertApi2Food, createFood } from "@/controllers/food";
import { setUserJson, useUser } from "@/redux/features/userSlice";
import { Food } from "@/model/foodModel";
import { useAppDispatch } from "@/redux/hooks";
import { updateUser } from "@/controllers/users";
import { User } from "@/model/userModel";

export type BarCodeSearchProps = {
    onFoodChange?: (food: Food | null) => void,
}

export default function BarCodeSearch(
    { onFoodChange }: BarCodeSearchProps
) {
    const [loading, setLoading] = useState(false);
    const [barCode, setBarCode] = useState('');
    const [currentFood, setCurrentFood] = useState<Food | null>(null);

    const dispatch = useAppDispatch();
    const currentUser = useUser();

    const onUserFavoritesChanged = async (user: User) => {
        const updatedUser = await updateUser(user.id, user);
        dispatch(setUserJson(JSON.stringify(updatedUser)));
    }


    const isFavorite = (favoriteFoods: string[], food: Food) => {
        return favoriteFoods.includes(food.id);
    }

    const EAN_LENGTH = 13;

    useEffect(() => {
        if (barCode.length != EAN_LENGTH) {
            return;
        }

        setLoading(true);
        const promise = searchBarCode(barCode).then(async (apiFood) => {
            const food = await createFood(convertApi2Food(apiFood));
            setCurrentFood(food);
        }).catch((err) => {
            console.error(err);
            alert(err);
        }).finally(() => {
            setLoading(false);
        });

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 100000);

        return () => {
            clearTimeout(timeout);
        }
    }, [barCode]);


    useEffect(() => {
        onFoodChange?.(currentFood);
    }, [currentFood, onFoodChange]);
    
    return (
        <div>
            <h3 className="font-bold text-lg text-white">Busca por código de barras (EAN)</h3>

            <div className="w-full text-center">
                <div className={`loading loading-lg transition-all ${loading ? 'h-80' : 'h-0'}`} />
            </div>

            {currentFood && (
                <div className="flex flex-col mt-3">
                    <div className="flex">
                        <div className="flex-1">
                            <p className="font-bold">
                                {currentFood.name}
                            </p>
                            <p className="text-sm">

                                <MealItem mealItem={{
                                    id: Math.random().toString(),
                                    food: currentFood,
                                    quantity: 100,
                                }}
                                favorite={
                                    currentUser.loading ? false :
                                        isFavorite(currentUser.data.favoriteFoods, currentFood)
                                }
                                setFavorite={(favorite) => {
                                    if (currentUser.loading) {
                                        return;
                                    }

                                    const newUser = Object.assign({}, currentUser.data);

                                    newUser.favoriteFoods = [...currentUser.data.favoriteFoods]

                                    if (favorite) {
                                        newUser.favoriteFoods.push(currentFood.id);
                                    } else {
                                        newUser.favoriteFoods = newUser.favoriteFoods.filter((f) => f != currentFood.id);
                                    }

                                    onUserFavoritesChanged(newUser);
                                }}
                                />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex mt-3">
                <input
                    type="number" placeholder="Código de barras (Ex: 7891234567890)"
                    className={`mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300`}
                    value={barCode} onChange={(e) => setBarCode(e.target.value.slice(0, 13))}
                />
            </div>
        </div>
    )
}