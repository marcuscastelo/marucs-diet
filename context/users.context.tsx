import { useEffect, useState } from 'react'
import { Loadable } from '@/utils/loadable'
import { User } from '@/model/userModel'
import { Food } from '@/model/foodModel'
import { createContext, useContext } from 'use-context-selector'

export type AvaliableUser = User

export type UserContextProps = {
  user: User
  isFoodFavorite: (foodId: Food['id']) => boolean
  setFoodAsFavorite: (foodId: Food['id'], favorite: boolean) => void
  debug: boolean
}

export const UserContext = createContext<UserContextProps | null>(null)

// TODO: Use context selectors to avoid unnecessary re-renders
export function useUserContext() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}

export function UserContextProvider({
  children,
  user,
  onSaveUser,
}: {
  children: React.ReactNode
  user: User
  onSaveUser: (user: User) => Promise<void>
}) {
  const handleIsFoodFavorite = (foodId: Food['id']) => {
    return user.favorite_foods.includes(foodId)
  }

  const handleSetFoodAsFavorite = (foodId: Food['id'], favorite: boolean) => {
    const newUser: User = {
      ...user,
      favorite_foods: favorite
        ? [...user.favorite_foods, foodId]
        : user.favorite_foods.filter((id) => id !== foodId),
    }

    onSaveUser(newUser)
  }

  const context: UserContextProps = {
    user,
    debug: false,
    isFoodFavorite: handleIsFoodFavorite,
    setFoodAsFavorite: handleSetFoodAsFavorite,
  }

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}
