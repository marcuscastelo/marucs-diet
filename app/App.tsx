'use client'

import { listUsers } from '@/controllers/users'
import { User } from '@/model/userModel'
import { useUser } from '@/redux/features/userSlice'
import { useEffect } from 'react'

export default function App({ children }: { children: React.ReactNode }) {
  const { setUserJson } = useUser()

  useEffect(() => {
    const onChangeUser = (user: User) => setUserJson(JSON.stringify(user))
    // TODO: listUsers should be a hook (useUsers, fetchUsers, etc. see fetchUser in userSlice.ts)
    listUsers().then((users) => {
      const localStoredUserId =
        typeof window !== 'undefined' && localStorage
          ? parseInt(localStorage.getItem('user') ?? '')
          : null
      if (localStoredUserId) {
        const user = users.find(
          (user) =>
            user.id ===
            /* TODO: Check if equality is a bug */ localStoredUserId,
        )
        if (user) {
          onChangeUser(user)
        } else if (users.length > 0) {
          onChangeUser(users[0])
        }
      } else if (users.length > 0) {
        onChangeUser(users[0])
      }
    })
  }, [setUserJson])

  return <>{children}</>
}
