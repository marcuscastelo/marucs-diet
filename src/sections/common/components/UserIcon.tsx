'use client'

import { User } from '@/legacy/model/userModel'
import Image from 'next/image'

export function UserIcon({
  userId,
  className,
}: {
  userId: User['id']
  className?: string
}) {
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
