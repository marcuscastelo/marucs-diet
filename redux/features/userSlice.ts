'use client';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";
import { User, userSchema } from "@/model/userModel";
import { Record } from "pocketbase";
import { Loadable } from "@/utils/loadable";

type UserState = Loadable<User>;

const initialState = {
    loading: true,
} as UserState;

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

            // TODO: avoid using localStorage directly
            localStorage.setItem('user', state.data?.id || '');
        }
    },
});

export const { setUserJson } = userSlice.actions;

export const useUser = () => useAppSelector((state) => state.userReducer);

export default userSlice.reducer;
