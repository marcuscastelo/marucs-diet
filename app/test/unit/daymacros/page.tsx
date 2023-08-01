'use client'

import DayMacros from '@/app/DayMacros'

export default function Page() {
  return (
    <>
      <DayMacros
        macros={{
          calories: 2000,
          protein: 200,
          carbs: 200,
          fat: 200,
        }}
      />
    </>
  )
}
