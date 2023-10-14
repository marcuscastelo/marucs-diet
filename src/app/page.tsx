'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToday } from '@/legacy/utils/dateUtils'

export default function Page() {
  const router = useRouter()
  const today = getToday()

  useEffect(() => {
    setTimeout(() => {
      router.replace(`/day/${today}`)
    }, 10)
  }, [router, today])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Bem vindo</h1>
      Hoje é {today.split('-').reverse().join('/')}
      <span className="loading loading-spinner loading-sm mt-5"></span>
    </div>
  )
}
