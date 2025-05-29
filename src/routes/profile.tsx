import { UserInfo } from '~/sections/profile/components/UserInfo'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'
import { MacroEvolution } from '~/sections/profile/components/MacroEvolution'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { MacroProfileComp } from '~/sections/profile/components/MacroProfile'

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
