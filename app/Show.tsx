'use client'

import { ReactNode } from 'react'

export default function Show({
  when,
  children,
}: {
  when: boolean
  children: ReactNode
}) {
  return when ? children : null
}
