'use client'

import { ReactNode } from 'react'

/**
 * @deprecated Use && operator instead
 * TODO: Remove Show component and all its usages
 */
export default function Show({
  when,
  children,
}: {
  when: boolean
  children: ReactNode
}) {
  return when ? children : null
}
