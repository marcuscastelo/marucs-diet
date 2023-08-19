'use client'

import ConfirmModal from '@/components/ConfirmModal'
import { ConfirmModalProvider } from '@/context/confirmModal.context'
import { DaysContextProvider } from '@/context/days.context'
import { FoodContextProvider } from '@/context/food.context'
import { UserContext, UserContextProvider } from '@/context/users.context'
import { listDays } from '@/controllers/days'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { fetchUsers, updateUser } from '@/controllers/users'
import { useContextSelector } from 'use-context-selector'

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <AppUserProvider>
      <AppDaysProvider>
        <AppConfirmModalProvider>
          <AppFoodsProvider>{children}</AppFoodsProvider>
        </AppConfirmModalProvider>
      </AppDaysProvider>
    </AppUserProvider>
  )
}

function AppUserProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppUserProvider] - Rendering`)
  return (
    <UserContextProvider
      onFetchAvailableUsers={async () => {
        return await fetchUsers()
      }}
      onFetchUser={async (id) => {
        return (await fetchUsers()).find((user) => user.id === id)
      }}
      onSaveUser={async (user) => {
        await updateUser(user.id, user)
      }}
    >
      {children}
    </UserContextProvider>
  )
}

function AppDaysProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppDaysProvider] - Rendering`)
  // TODO: useUserId() is not working here
  const userId = useContextSelector(
    UserContext,
    (ctx) =>
      ctx &&
      !(ctx.user.loading || ctx.user.errored) &&
      Number(ctx.user.data.id),
  )

  if (!userId) {
    return <div>UserId not found</div>
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

  // const { user } = useUserContext()
  // if (user.loading || user.errored) {
  //   return <div>User loading or errored aa</div>
  // }
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
          return await searchFoodsByName(search, { limit: 100 })
        } else {
          console.debug(
            `[FoodContextProvider] onFetchFoods - calling listFoods`,
          )
          return await listFoods({ limit: 100 })
        }
      }}
    >
      {children}
    </FoodContextProvider>
  )
}
