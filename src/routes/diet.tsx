import { Show } from 'solid-js'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'
import TopBar from '~/sections/day-diet/components/TopBar'

export default function DietPage() {
  return (
    <div class="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={targetDay()} />
      <Show when={currentDayDiet()} fallback={<div>Loading...</div>}>
        {(currentDayDiet) => (
          <DayMacros dayDiet={currentDayDiet()} class="mb-4" />
        )}
      </Show>
      {/* Display meals for the selected day */}
      <DayMeals selectedDay={targetDay()} />
      <BottomNavigation />
    </div>
  )
}
