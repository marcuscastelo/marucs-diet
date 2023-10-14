// "use client";

// TODO: delete favorite.context.tsx

// import { useUser } from "@/redux/features/userSlice";
// import React, { Dispatch,  useReducer } from "react";

// type StateType = {
//     favorite: boolean;
// };

// type ActionType = {
//     type: string;
// };

// const initialState: StateType = {
//     favorite: false,
// };

// const reducer = (state: StateType, action: ActionType) => {
//     switch (action.type) {
//         case "INCREMENT":
//             return { ...state, favorite: true };
//         case "DECREMENT":
//             return { ...state, favorite: false };
//         case "RESET":
//             return { ...state, favorite: false };
//         default:
//             return state;
//     }
// };

// export const CounterContext = createContext<{
//     state: StateType;
//     dispatch: Dispatch<ActionType>;
// }>({ state: initialState, dispatch: () => null });

// export const CounterContextProvider = ({
//     foodId,
//     children,
// }: {
//     foodId: string;
//     children: React.ReactNode;
// }) => {
//     const [state, dispatch] = useReducer(reducer, initialState);

//     return (
//         <CounterContext.Provider value={{ state, dispatch }}>
//             {children}
//         </CounterContext.Provider>
//     );
// };
