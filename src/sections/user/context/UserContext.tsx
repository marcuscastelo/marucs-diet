import { User } from '@/modules/user/domain/user'
import { Food } from '@/modules/food/domain/food'
import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector'

export type AvaliableUser = User

export type UserContextProps = {
  user: User
  isFoodFavorite: (foodId: Food['id']) => boolean
  setFoodAsFavorite: (foodId: Food['id'], favorite: boolean) => void
  debug: boolean
}

export const UserContext = createContext<UserContextProps | null>(null)

function assertedContext(context: UserContextProps | null) {
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}

// TODO: Use context selectors to avoid unnecessary re-renders
export function useUserContext() {
  const context = useContext(UserContext)
  return assertedContext(context)
}

export const useUserId = () =>
  useContextSelector(UserContext, (context) => assertedContext(context).user.id)

export const useUserGender = () =>
  useContextSelector(
    UserContext,
    (context) => assertedContext(context).user.gender,
  )

export const useUserDesiredWeight = () =>
  useContextSelector(
    UserContext,
    (context) => assertedContext(context).user.desired_weight,
  )

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
