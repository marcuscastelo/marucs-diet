'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../hooks'
import { User, userSchema } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import { updateUser } from '@/controllers/users'
import { useCallback, useMemo } from 'react'

type LoadingExtras = { fetchingId?: number }
export type UserState = Loadable<User, LoadingExtras>

const initialState = {
  loading: true,
} as UserState // as UserState is needed to avoid type error

// TODO: retriggered: avoid using localStorage directly
async function saveUser(userData: User) {
  if (typeof window !== 'undefined')
    localStorage?.setItem('user', userData.id.toString())
  await updateUser(userData.id, userData)
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // TODO: Change setUserJson to setUser
    setUserJson: (state, action: PayloadAction<string>) => {
      state.loading = false
      if (state.loading) {
        return
      }

      const newUserData = userSchema.parse(JSON.parse(action.payload))

      state.data = {
        ...state.data,
        ...newUserData,
      }

      saveUser(state.data)
    },
    fetchUser: (state, action: PayloadAction<User['id']>) => {
      console.error('fetchUser: not implemented')
      // state.loading = true;
      // if (state.loading) {
      //     state.loadingExtras = {
      //         fetchingId: action.payload,
      //     }
      // }
    },
    setFavoriteFoods: (state, action: PayloadAction<number[]>) => {
      if (state.loading) {
        console.error('setFavoriteFoods: user is not loaded')
        return
      }

      state.data = {
        ...state.data,
        favorite_foods: action.payload,
      }

      saveUser(state.data)
    },
    setFoodAsFavorite: (
      state,
      action: PayloadAction<{ foodId: number; favorite: boolean }>,
    ) => {
      if (state.loading) {
        console.error('removeFavoriteFood: user is not loaded')
        return
      }

      if (action.payload.favorite) {
        state.data = {
          ...state.data,
          favorite_foods: [...state.data.favorite_foods, action.payload.foodId],
        }
      } else {
        state.data = {
          ...state.data,
          favorite_foods: state.data.favorite_foods.filter(
            (food) => food !== action.payload.foodId,
          ),
        }
      }

      saveUser(state.data)
    },
  },
})

const { setUserJson, fetchUser, setFavoriteFoods, setFoodAsFavorite } =
  userSlice.actions

export const useUser = () => {
  const user = useAppSelector((state) => state.userReducer)
  const appDispatch = useAppDispatch()

  const dispatch = useMemo(
    () =>
      ({
        setUserJson: (userJson: string) => appDispatch(setUserJson(userJson)),
        fetchUser: async (userId: User['id']) => appDispatch(fetchUser(userId)),
      }) as const,
    [appDispatch],
  )

  // useEffect(() => {
  //     let ignore = false;
  //     if (user.loading && user.loadingExtras?.fetchingId) {
  //         listUsers().then((users) => {
  //             if (!user.loading || ignore) {
  //                 return;
  //             }

  //             const userData = users.find((u) => u.id === /* TODO: Check if equality is a bug */ user.loadingExtras?.fetchingId);

  //             if (!userData) {
  //                 console.error(`fetchUser: user ${user.loadingExtras?.fetchingId} not found`);
  //                 return;
  //             }

  //             const newUser: Loadable<User, LoadingExtras> = {
  //                 loading: false,
  //                 data: userSchema.parse(userData),
  //             }

  //             appDispatch(setUserJson(JSON.stringify(newUser)));
  //             // dispatch.setUserJson(JSON.stringify(newUser));
  //         });
  //     }

  //     return () => { ignore = true; };
  // }, [user, appDispatch]);

  return {
    user,
    ...dispatch,
  } as const
}

export const useFavoriteFoods = () => {
  const user = useAppSelector((state) => state.userReducer)
  const favoriteFoods = user.loading ? [] : user.data.favorite_foods
  const isFoodFavorite = (foodId: number) => favoriteFoods.includes(foodId)

  const appDispatch = useAppDispatch()

  const dispatch = {
    setFavoriteFoods: useCallback(
      (favoriteFoods: number[]) => appDispatch(setFavoriteFoods(favoriteFoods)),
      [appDispatch],
    ),
    setFoodAsFavorite: useCallback(
      (foodId: number, favorite: boolean) =>
        appDispatch(setFoodAsFavorite({ foodId, favorite })),
      [appDispatch],
    ),
  }

  return {
    favoriteFoods,
    isFoodFavorite,
    ...dispatch,
  } as const
}

export default userSlice.reducer
