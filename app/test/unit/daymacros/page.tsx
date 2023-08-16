'use client'

import DayMacros from '@/app/DayMacros'

export default function Page() {
  return (
    <>
      <DayMacros
        macros={{
          protein: 200,
          carbs: 200,
          fat: 200,
        }}
      />
    </>
  )
}
