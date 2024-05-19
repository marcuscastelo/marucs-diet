import { targetDay } from '~/modules/diet/day-diet/application/dayDiet'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { Providers } from '~/sections/common/context/Providers'
import DayMeals from '~/sections/day-diet/components/DayMeals'
import TopBar from '~/sections/day-diet/components/TopBar'

export default function DietPage() {
  return (
    <Providers>
      <div class="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
        {/* Top bar with date picker and user icon */}
        <TopBar selectedDay={targetDay()} />
        <DayMeals selectedDay={targetDay()} />
        <BottomNavigation />
        <div class="fixed right-5 bottom-0">
          Version: {process.env.APP_VERSION}
        </div>
      </div>
    </Providers>
  )
}
