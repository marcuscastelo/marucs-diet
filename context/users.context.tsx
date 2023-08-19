import { useEffect, useState } from 'react'
import { Loadable } from '@/utils/loadable'
import { User } from '@/model/userModel'
import { Food } from '@/model/foodModel'
import { createContext, useContext } from 'use-context-selector'

export type AvaliableUser = User

export type UserContextProps = {
  user: Loadable<User>
  availableUsers: Loadable<AvaliableUser[]>
  fetchAvailableUsers: () => Promise<void>
  changeUser: (id: User['id']) => Promise<void>
  setUser: (user: User) => void
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

// TODO: Revive useUserId
// export function useUserId() {
//   const userId: Loadable<User['id']> = useContextSelector(
//     UserContext,
//     (context) => {
//       if (!context) {
//         throw new Error('useUserId must be used within a UserContextProvider')
//       }

//       if (context.user.loading) {
//         return { loading: true }
//       }

//       if (context.user.errored) {
//         return { loading: false, errored: true, error: context.user.error }
//       }

//       return {
//         loading: false,
//         errored: false,
//         data: context.user.data.id,
//       }
//     },
//   )

//   return userId
// }

export function UserContextProvider({
  children,
  onFetchUser,
  onFetchAvailableUsers,
  onSaveUser,
}: {
  children: React.ReactNode
  onFetchUser: (id: User['id']) => Promise<User | undefined>
  onFetchAvailableUsers: () => Promise<AvaliableUser[]>
  onSaveUser: (user: User) => Promise<void>
}) {
  const [user, setUser] = useState<Loadable<User>>({ loading: true })
  const [availableUsers, setAvailableUsers] = useState<
    Loadable<AvaliableUser[]>
  >({ loading: true })

  useEffect(() => {
    if (!user.loading && !user.errored && user.data) {
      // TODO: Convert to serverAction
      localStorage.setItem('userId', user.data.id.toString())
    }
  }, [user])

  // At first, we fetch the available users and set the first one as the current user
  useEffect(() => {
    const ignore = false
    onFetchAvailableUsers()
      .then(async (users) => {
        if (ignore) {
          return
        }
        setAvailableUsers({ loading: false, errored: false, data: users })
        if (users.length > 0) {
          // TODO: Convert to serverAction
          const value = localStorage.getItem('userId')
          const localStorageUserId = value !== null && parseInt(value)
          const userId = users.find((u) => u.id === localStorageUserId)?.id

          const user = await onFetchUser(userId ?? users[0].id)
          if (!user) {
            throw new Error('User not found')
          }

          if (ignore) {
            return
          }

          setUser({ loading: false, errored: false, data: user })
        }
      })
      .catch((err) => {
        console.error(err)
        alert(err)
      })
  }, [onFetchUser, onFetchAvailableUsers])

  const handleSetUser = (user: User) => {
    setUser({ loading: false, errored: false, data: user })
  }

  const handleChangeUser = async (id: User['id']) => {
    setUser({ loading: true })
    try {
      const user = await onFetchUser(id)
      if (!user) {
        throw new Error('User not found')
      }
      setUser({ loading: false, errored: false, data: user })
    } catch (error) {
      setUser({ loading: false, errored: true, error: error as Error })
    }
  }

  const handleFetchAvailableUsers = async () => {
    setAvailableUsers({ loading: true })
    try {
      const users = await onFetchAvailableUsers()
      setAvailableUsers({ loading: false, errored: false, data: users })
    } catch (error) {
      setAvailableUsers({
        loading: false,
        errored: true,
        error: error as Error,
      })
    }
  }

  const handleIsFoodFavorite = (foodId: Food['id']) => {
    if (user.loading || user.errored) {
      return false
    }
    return user.data.favorite_foods.includes(foodId)
  }

  const handleSetFoodAsFavorite = (foodId: Food['id'], favorite: boolean) => {
    if (user.loading || user.errored) {
      return
    }

    const newUser: User = {
      ...user.data,
      favorite_foods: favorite
        ? [...user.data.favorite_foods, foodId]
        : user.data.favorite_foods.filter((id) => id !== foodId),
    }

    onSaveUser(newUser)
      .then(() => {
        setUser({ loading: false, errored: false, data: newUser })
      })
      .catch((error) => {
        setUser({ loading: false, errored: true, error })
      })
  }

  const context: UserContextProps = {
    user,
    debug: false,
    setUser: handleSetUser,
    changeUser: handleChangeUser,
    availableUsers,
    fetchAvailableUsers: handleFetchAvailableUsers,
    isFoodFavorite: handleIsFoodFavorite,
    setFoodAsFavorite: handleSetFoodAsFavorite,
  }

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}
