import { type JSXElement } from 'solid-js'
import { targetDay } from '~/modules/diet/day-diet/application/dayDiet'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '~/sections/common/context/ConfirmModalContext'
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

// TODO: Apply provider pattern to all routes
function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
