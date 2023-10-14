'use client'

import TopBar from '@/sections/day/components/TopBar'
import DayMeals from '@/sections/day/components/DayMeals'

import { BottomNavigation } from '@/sections/common/components/BottomNavigation'

type PageParams = {
  params: {
    day: string
  }
}

export default function Page({ params }: PageParams) {
  console.debug(`[DayPage] Rendering day ${params.day}`)
  const selectedDay = params.day

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={selectedDay} />
      <DayMeals selectedDay={selectedDay} />
      <BottomNavigation />
    </div>
  )
}
