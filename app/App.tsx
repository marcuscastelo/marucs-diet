'use client'

import ConfirmModal from '@/components/ConfirmModal'
import { ConfirmModalProvider } from '@/context/confirmModal.context'
import { DaysContextProvider } from '@/context/days.context'
import { UserContextProvider, useUserContext } from '@/context/users.context'
import { listDays } from '@/controllers/days'
import { listUsers } from '@/controllers/users'

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <AppUserProvider>
      <AppDaysProvider>
        <AppConfirmModalProvider>{children}</AppConfirmModalProvider>
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
