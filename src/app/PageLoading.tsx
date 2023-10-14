'use client'

import { useEffect, useState } from 'react'
import LoadingRing from '@/app/LoadingRing'

export type PageLoadingProps = {
  message: string
}

export default function PageLoading({ message }: PageLoadingProps) {
  const [label, setLabel] = useState(message)
  const [tooSlow, setTooSlow] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const dots = label.match(/\./g)?.length || 0
      if (dots < 3) {
        setLabel(label + '.')
      } else {
        setLabel(message)
      }
    }, 300)

    return () => {
      clearInterval(interval)
    }
  }, [label, message])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTooSlow(true)
    }, 5000)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className={`flex h-full min-h-screen w-full justify-center`}>
      <div className="flex w-full flex-col justify-center align-middle">
        <LoadingRing />
        <span className="inline-block w-full text-center">{label}</span>
        {tooSlow && (
          <span className="inline-block w-full text-center text-red-500">
            O servidor está demorando para responder. Tente novamente mais
            tarde.
          </span>
        )}
      </div>
    </div>
  )
}
