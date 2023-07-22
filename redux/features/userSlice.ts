'use client';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";
import { User } from "@/model/userModel";
import { Record } from "pocketbase";
import { Loadable } from "@/utils/loadable";

type UserState = Loadable<User & Record>;

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

            state.data = {
                ...state.data,
                ...JSON.parse(action.payload),
            }

            // TODO: avoid using localStorage directly
            localStorage.setItem('user', state.data?.id || '');
        }
    },
});

export const { setUserJson } = userSlice.actions;

export const useUser = () => useAppSelector((state) => state.userReducer);

export default userSlice.reducer;
