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
        setUserJson: (state, action) => {
            const newUser = {
                ...state,
                ...JSON.parse(action.payload),
                loading: false,
            };
            console.log(newUser);
            (state as any) = newUser;
            return newUser;
        }
    },
});

export const { setUserJson } = userSlice.actions;

export const useUser = () => useAppSelector((state) => state.userReducer);

export default userSlice.reducer;
