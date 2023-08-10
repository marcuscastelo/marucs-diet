'use client'

import {
  AvaliableUser,
  UserContextProvider,
  useUserContext,
} from '@/context/users.context'
import { listUsers } from '@/controllers/users'
import { User } from '@/model/userModel'
import { useEffect } from 'react'

export default function App({ children }: { children: React.ReactNode }) {
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
