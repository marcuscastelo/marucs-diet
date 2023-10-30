'use client'

import { ReactNode } from 'react'

export default function Capsule({
  leftContent,
  rightContent,
  className,
}: {
  leftContent: ReactNode
  rightContent: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 sm:gap-0 overflow-visible mt-10 sm:mt-0 ${
        className || ''
      }`}
    >
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-700 text-left rounded-3xl sm:rounded-r-none`}
      >
        {leftContent}
      </div>
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-900 text-left rounded-3xl sm:rounded-l-none`}
      >
        {rightContent}
      </div>
    </div>
  )
}
