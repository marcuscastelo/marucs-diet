import { createSignal, onCleanup } from 'solid-js'

import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { MacroEvolution } from '~/sections/profile/components/MacroEvolution'
import { MacroProfileComp } from '~/sections/profile/components/MacroProfile'
import { UserInfo } from '~/sections/profile/components/UserInfo'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'

function useAspectWidth() {
  const [width, setWidth] = createSignal(getWidth())
  function getWidth() {
    return Math.min((window.innerHeight * 9) / 16, window.innerWidth)
  }
  function onResize() {
    setWidth(getWidth())
  }
  window.addEventListener('resize', onResize)
  onCleanup(() => window.removeEventListener('resize', onResize))
  return width
}

export default function Page() {
  const width = useAspectWidth()
  return (
    <div>
      <div
        class={'mx-auto w-full flex flex-col justify-between pt-1'}
        style={{ width: `${width()}px` }}
      >
        <UserInfo />
        <WeightEvolution />
        <MacroProfileComp />
        <MacroEvolution />
        <MeasuresEvolution />
      </div>
      <BottomNavigation />
    </div>
  )
}
