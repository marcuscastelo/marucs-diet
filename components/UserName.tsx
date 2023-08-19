'use client'

import { useUserContext } from '@/context/users.context'
import Link from 'next/link'

export default function UserName() {
  const { user } = useUserContext()

  if (user.loading || user.errored) {
    return 'Carregando...'
  }

  return <Link href="/profile">{user.data.name}</Link>
}
