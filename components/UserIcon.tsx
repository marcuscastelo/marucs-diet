'use client'

import { useUserId } from '@/context/users.context'
import Image from 'next/image'

export function UserIcon({ className }: { className?: string }) {
  const userId = useUserId()

  return (
    <div className={className}>
      <Image
        className="w-full h-full rounded-full"
        src={`https://sbhhxgeaflzmzpmatnir.supabase.co/storage/v1/object/public/uploads/${userId}.jpg`}
        sizes="100vw"
        alt=""
        width={0}
        height={0}
      />
    </div>
  )
}
