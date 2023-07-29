'use client';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "../hooks";
import { User, userSchema } from "@/model/userModel";
import { Record } from "pocketbase";
import { Loadable } from "@/utils/loadable";
import { updateUser } from "@/controllers/users";
import { AppDispatch } from "../store";
import { useCallback } from "react";

type UserState = Loadable<User>;

const initialState = {
    loading: true,
} as UserState; // as UserState is needed to avoid type error

// TODO: retriggered: avoid using localStorage directly
async function saveUser(userData: User) {
    if (typeof window !== 'undefined')
        localStorage?.setItem('user', userData.id.toString());
    await updateUser(userData.id, userData);
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserJson: (state, action: PayloadAction<string>) => { //TODO: use actual type (no Record)
            state.loading = false;
            if (state.loading) {
                return;
            }

            const newUserData = userSchema.parse(JSON.parse(action.payload));

            state.data = {
                ...state.data,
                ...newUserData,
            }

            saveUser(state.data);
        },
        setFavoriteFoods: (state, action: PayloadAction<number[]>) => {
            if (state.loading) {
                console.error('setFavoriteFoods: user is not loaded');
                return;
            }

            state.data = {
                ...state.data,
                favorite_foods: action.payload,
            }

            saveUser(state.data);
        },
        setFoodAsFavorite: (state, action: PayloadAction<{foodId: number, favorite: boolean}>) => {
            if (state.loading) {
                console.error('removeFavoriteFood: user is not loaded');
                return;
            }

            if (action.payload.favorite) {
                state.data = {
                    ...state.data,
                    favorite_foods: [
                        ...state.data.favorite_foods,
                        action.payload.foodId,
                    ],
                }
            } else {
                state.data = {
                    ...state.data,
                    favorite_foods: state.data.favorite_foods.filter((food) => food !== action.payload.foodId),
                }
            }

            saveUser(state.data);
        }
    },
});

const { setUserJson, setFavoriteFoods, setFoodAsFavorite } = userSlice.actions;

export const useUser = () => {
    const user = useAppSelector((state) => state.userReducer);
    const appDispatch = useAppDispatch();

    const dispatch = {
        setUserJson: useCallback((userJson: string) => appDispatch(setUserJson(userJson)), [appDispatch])
    } as const;

    return {
        user,
        ...dispatch,
    } as const;
}
 
export const useFavoriteFoods = () => {
    const user = useAppSelector((state) => state.userReducer);
    const favoriteFoods = user.loading ? [] : user.data.favorite_foods;
    const isFoodFavorite = (foodId: number) => favoriteFoods.includes(foodId);

    const appDispatch = useAppDispatch();

    const dispatch = {
        setFavoriteFoods: useCallback((favoriteFoods: number[]) => appDispatch(setFavoriteFoods(favoriteFoods)), [appDispatch]),
        setFoodAsFavorite: useCallback((foodId: number, favorite: boolean) => appDispatch(setFoodAsFavorite({ foodId, favorite })), [appDispatch]),
    }

    return {
        favoriteFoods,
        isFoodFavorite,
        ...dispatch,
    } as const;
}

export default userSlice.reducer;
