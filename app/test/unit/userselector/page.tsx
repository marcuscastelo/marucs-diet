'use client'

import UserSelector from '@/app/UserSelector'
import { useUser } from '@/redux/features/userSlice'

export default function Page() {
  const { user } = useUser()
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
