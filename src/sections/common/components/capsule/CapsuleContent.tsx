import { ReactNode } from 'react'

export function CapsuleContent({ children }: { children: ReactNode }) {
  return (
    <div className={`ml-2 p-2 text-xl flex justify-between`}>{children}</div>
  )
}
