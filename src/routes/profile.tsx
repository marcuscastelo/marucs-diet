import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { MacroEvolution } from '~/sections/profile/components/MacroEvolution'
import { MacroProfileComp } from '~/sections/profile/components/MacroProfile'
import { UserInfo } from '~/sections/profile/components/UserInfo'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'

export default function Page() {
  return (
    <div>
      <div class={'mx-1 md:mx-40 lg:mx-auto lg:w-1/3 pt-1'}>
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
