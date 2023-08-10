'use client'

import UserSelector from '@/app/UserSelector'
import { useUserContext } from '@/context/users.context'

export default function Page() {
  const { user } = useUserContext()
  return (
    <div className="w-64">
      <div className="mb-10">
        <UserSelector />
      </div>

      <code className="text-xs">
        <pre>{JSON.stringify(user, null, 4)}</pre>
      </code>
    </div>
  )
}
