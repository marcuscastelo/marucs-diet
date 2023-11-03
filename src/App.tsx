import { BottomNavigation } from '@/sections/common/components/BottomNavigation'
import { ConfirmModal } from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'
import DayMeals from '@/sections/day-diet/components/DayMeals'
import TopBar from '@/sections/day-diet/components/TopBar'
import { type JSXElement } from 'solid-js'

export default function App () {
  const selectedDay = '2023-11-02'

  return (
    <div class="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <Providers>
        <TopBar selectedDay={selectedDay} />
        <DayMeals selectedDay={selectedDay} />
        <BottomNavigation />
      </Providers>
    </div>
  )
}

function Providers (props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
