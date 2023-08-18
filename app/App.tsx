'use client'

import ConfirmModal from '@/components/ConfirmModal'
import { ConfirmModalProvider } from '@/context/confirmModal.context'
import { DaysContextProvider } from '@/context/days.context'
import { FoodContextProvider } from '@/context/food.context'
import { UserContextProvider, useUserContext } from '@/context/users.context'
import { listDays } from '@/controllers/days'
import { listFoods } from '@/controllers/food'
import { listUsers, updateUser } from '@/controllers/users'

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
  return (
    <UserContextProvider
      onFetchAvailableUsers={async () => {
        return await listUsers()
      }}
      onFetchUser={async (id) => {
        return (await listUsers()).find((user) => user.id === id)
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
  const { user } = useUserContext()

  if (user.loading || user.errored) {
    return <div>User loading or errored</div>
  }

  return (
    <DaysContextProvider
      userId={user.data.id}
      onFetchDays={async () => {
        return await listDays(user.data.id)
      }}
    >
      {children}
    </DaysContextProvider>
  )
}

function AppConfirmModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {children}
    </ConfirmModalProvider>
  )
}

function AppFoodsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext()
  if (user.loading || user.errored) {
    return <div>User loading or errored aa</div>
  }
  return (
    <FoodContextProvider
      onFetchFoods={async () => {
        return await listFoods(100, user.data.favorite_foods)
      }}
    >
      {children}
    </FoodContextProvider>
  )
}
