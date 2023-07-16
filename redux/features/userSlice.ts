import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    name: string;
}

const initialState: UserState = {
    name: 'Marcus'
}


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        }
    },
});

export const { setName } = userSlice.actions;

export default userSlice.reducer;
