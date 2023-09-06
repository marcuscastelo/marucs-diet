'use client'

import ConfirmModal from '@/components/ConfirmModal'
import { ConfirmModalProvider } from '@/context/confirmModal.context'
import { DaysContextProvider } from '@/context/days.context'
import { FoodContextProvider } from '@/context/food.context'
import {
  UserContextProvider,
  useUserContext,
  useUserId,
} from '@/context/users.context'
import { listDays } from '@/controllers/days'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { updateUser } from '@/controllers/users'
import { User } from '@/model/userModel'

export default function App({
  user,
  onSaveUser,
  children,
}: {
  user: User
  onSaveUser: () => void
  children: React.ReactNode
}) {
  return (
    <AppUserProvider user={user} onSaveUser={onSaveUser}>
      <AppDaysProvider>
        <AppConfirmModalProvider>
          <AppFoodsProvider>{children}</AppFoodsProvider>
        </AppConfirmModalProvider>
      </AppDaysProvider>
    </AppUserProvider>
  )
}

function AppUserProvider({
  user,
  onSaveUser,
  children,
}: {
  user: User
  onSaveUser: () => void
  children: React.ReactNode
}) {
  console.debug(`[AppUserProvider] - Rendering`)
  return (
    <UserContextProvider
      user={user}
      onSaveUser={async (user) => {
        await updateUser(user.id, user)
        onSaveUser()
      }}
    >
      {children}
    </UserContextProvider>
  )
}

function AppDaysProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppDaysProvider] - Rendering`)

  const userId = useUserId()

  if (!userId) {
    return <div>UserId is undefined</div>
  }

  return (
    <DaysContextProvider
      userId={userId}
      onFetchDays={async () => {
        return await listDays(userId)
      }}
    >
      {children}
    </DaysContextProvider>
  )
}

function AppConfirmModalProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppConfirmModalProvider] - Rendering`)

  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {children}
    </ConfirmModalProvider>
  )
}

function AppFoodsProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppFoodsProvider] - Rendering`)

  const { user } = useUserContext()

  return (
    <FoodContextProvider
      onFetchFoods={async (search?: string) => {
        console.debug(
          `[FoodContextProvider] onFetchFoods - called with search: ${search}`,
        )
        if (search) {
          console.debug(
            `[FoodContextProvider] onFetchFoods - calling searchFoodsByName`,
          )
          return {
            foods: await searchFoodsByName(search, { limit: 100 }),
            favoriteFoods: await searchFoodsByName(search, {
              limit: 100,
              allowedFoods: user.favorite_foods,
            }),
          }
        } else {
          console.debug(
            `[FoodContextProvider] onFetchFoods - calling listFoods`,
          )
          return {
            foods: await listFoods({ limit: 100 }),
            favoriteFoods: await listFoods({
              limit: 100,
              allowedFoods: user.favorite_foods,
            }),
          }
        }
      }}
    >
      {children}
    </FoodContextProvider>
  )
}
