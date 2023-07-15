//                                                                                                  import { createSlice } from "@reduxjs/toolkit";
// import { AppState } from "@/store/store";
// import { HYDRATE } from "next-redux-wrapper";

// export interface UserState {
//     name: string;
// }

// const initialState: UserState = {
//     name: 'Simone'
// }

// const userSlice = createSlice({
//     name: 'user',
//     initialState,
//     reducers: {
//         setName: (state, action) => {
//             state.name = action.payload;
//         }
//     },
//     extraReducers: {
//         [HYDRATE]: (state, action) => {
//             return {
//                 ...state,
//                 ...action.payload.user
//             }
//         }
//     }
// });
 
// export const { setName } = userSlice.actions;

// export const selectUser = (state: AppState) => state.user;

// export default userSlice;
    