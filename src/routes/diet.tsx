import { Show } from 'solid-js'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'
import TopBar from '~/sections/day-diet/components/TopBar'
import { getTodayYYYYMMDD } from '~/shared/utils/date'
import { Alert } from '~/sections/common/components/Alert'

export default function DietPage() {
  const today = getTodayYYYYMMDD()
  const mode = () => (targetDay() === today ? 'edit' : 'read-only')

  return (
    <div class="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      <TopBar selectedDay={targetDay()} />
      <Show when={currentDayDiet()} fallback={<div>Loading...</div>}>
        {(currentDayDiet) => (
          <DayMacros dayDiet={currentDayDiet()} class="mb-4" />
        )}
      </Show>
      {mode() !== 'edit' && (
        <Alert class="mt-2" color="yellow">
          Mostrando refeições do dia {targetDay()}!
        </Alert>
      )}
      <DayMeals selectedDay={targetDay()} mode={mode()} />
      <BottomNavigation />
    </div>
  )
}
