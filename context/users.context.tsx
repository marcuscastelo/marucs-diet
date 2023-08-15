import { useEffect, useState } from 'react'
import { Loadable } from '@/utils/loadable'
import { User } from '@/model/userModel'
import { Food } from '@/model/foodModel'
import { createContext, useContext } from 'use-context-selector'

export type AvaliableUser = Pick<User, 'id' | 'name'>

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

const UserContext = createContext<UserContextProps | null>(null)

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
  onFetchUser,
  onFetchAvailableUsers,
}: {
  children: React.ReactNode
  onFetchUser: (id: User['id']) => Promise<User | undefined>
  onFetchAvailableUsers: () => Promise<AvaliableUser[]>
}) {
  const [user, setUser] = useState<Loadable<User>>({ loading: true })
  const [availableUsers, setAvailableUsers] = useState<
    Loadable<AvaliableUser[]>
  >({ loading: true })

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
          const user = await onFetchUser(users[0].id)
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
  }, [])

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
  const context: UserContextProps = {
    user,
    debug: true,
    setUser: handleSetUser,
    changeUser: handleChangeUser,
    availableUsers,
    fetchAvailableUsers: handleFetchAvailableUsers,
    isFoodFavorite: (foodId: Food['id']) => false,
    setFoodAsFavorite: (foodId: Food['id'], isFavorite: boolean) => undefined,
  }

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}
