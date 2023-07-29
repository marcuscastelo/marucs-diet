'use client';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";
import { User, userSchema } from "@/model/userModel";
import { Record } from "pocketbase";
import { Loadable } from "@/utils/loadable";
import { updateUser } from "@/controllers/users";

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
        setUserJson: (state, action: PayloadAction<string>) => {
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
                favorite_foods: action.payload,
            }

            saveUser(state.data);
        },
        setFoodAsFavorite: (state, action: PayloadAction<{foodId: string, favorite: boolean}>) => {
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

export const { setUserJson, setFavoriteFoods, setFoodAsFavorite } = userSlice.actions;

export const useUser = () => useAppSelector((state) => state.userReducer);

export const useFavoriteFoods = () => useAppSelector((state) => {
    const loadable = state.userReducer;
    if (loadable.loading) 
        return [];

    const user = loadable.data;
    return user.favorite_foods;
});

export const useIsFoodFavorite = () => useAppSelector((state) => {
    const loadable = state.userReducer;

    return (foodId: string) => {
        if (loadable.loading)
            return false;
        
        const user = loadable.data;
        return user.favorite_foods.includes(foodId);
    }
});

export default userSlice.reducer;
