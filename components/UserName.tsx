'use client'

import { useUserContext } from '@/context/users.context'
import Link from 'next/link'

export function UserName() {
  const { user } = useUserContext()

  return <Link href="/profile">{user.name}</Link>
}
