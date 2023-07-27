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

// TODO: avoid using localStorage directly
async function saveUser(userData: User) {
    localStorage.setItem('user', userData.id);
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
        setFavoriteFoods: (state, action: PayloadAction<string[]>) => {
            if (state.loading) {
                console.error('setFavoriteFoods: user is not loaded');
                return;
            }

            state.data = {
                ...state.data,
                favoriteFoods: action.payload,
            }

            saveUser(state.data);
        },
        setFoodAsFavorite: (state, action: PayloadAction<{ foodId: string, favorite: boolean }>) => {
            if (state.loading) {
                console.error('removeFavoriteFood: user is not loaded');
                return;
            }

            if (action.payload.favorite) {
                state.data = {
                    ...state.data,
                    favoriteFoods: [
                        ...state.data.favoriteFoods,
                        action.payload.foodId,
                    ],
                }
            } else {
                state.data = {
                    ...state.data,
                    favoriteFoods: state.data.favoriteFoods.filter((food) => food !== action.payload.foodId),
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
    const favoriteFoods = user.loading ? [] : user.data.favoriteFoods;
    const isFoodFavorite = (foodId: string) => favoriteFoods.includes(foodId);

    const appDispatch = useAppDispatch();

    const dispatch = {
        setFavoriteFoods: useCallback((favoriteFoods: string[]) => appDispatch(setFavoriteFoods(favoriteFoods)), [appDispatch]),
        setFoodAsFavorite: useCallback((foodId: string, favorite: boolean) => appDispatch(setFoodAsFavorite({ foodId, favorite })), [appDispatch]),
    }

    return {
        favoriteFoods,
        isFoodFavorite,
        ...dispatch,
    } as const;
}

export default userSlice.reducer;
