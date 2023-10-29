'use client'

import LoadingRing from '@/sections/common/components/LoadingRing'
import { useSignal, useSignalEffect } from '@preact/signals-react'

export type PageLoadingProps = {
  message: string
}

export default function PageLoading({ message }: PageLoadingProps) {
  const label = useSignal(message)
  const tooSlow = useSignal(false)

  useSignalEffect(() => {
    setInterval(() => {
      const dots = label.value.match(/\./g)?.length ?? 0
      if (dots < 3) {
        label.value = label.peek() + '.'
      } else {
        label.value = message
      }
    }, 300)
  })

  useSignalEffect(() => {
    setTimeout(() => {
      tooSlow.value = true
    }, 5000)
  })

  return (
    <div className={`flex h-full min-h-screen w-full justify-center`}>
      <div className="flex w-full flex-col justify-center align-middle">
        <LoadingRing />
        <span className="inline-block w-full text-center">{label}</span>
        {tooSlow.value && (
          <span className="inline-block w-full text-center text-red-500">
            O servidor está demorando para responder. Tente novamente mais
            tarde.
          </span>
        )}
      </div>
    </div>
  )
}
