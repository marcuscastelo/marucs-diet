'use client'

import ConfirmModal from '@/components/ConfirmModal'
import { ConfirmModalProvider } from '@/context/confirmModal.context'
import { DaysContextProvider } from '@/context/days.context'
import { FoodContextProvider } from '@/context/food.context'
import { UserContext, UserContextProvider } from '@/context/users.context'
import { listDays } from '@/controllers/days'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { updateUser } from '@/controllers/users'
import { User } from '@/model/userModel'
import { useContextSelector } from 'use-context-selector'

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
  // TODO: useUserId() is not working here
  const userId = useContextSelector(
    UserContext,
    (ctx) => ctx && Number(ctx.user.id),
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
