import { MacroEvolution } from '~/sections/profile/components/MacroEvolution'
import { MacroProfileComp } from '~/sections/profile/components/MacroProfile'
import { UserInfo } from '~/sections/profile/components/UserInfo'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'

export default function Page() {
  return (
    <>
      <UserInfo />
      <WeightEvolution />
      <MacroProfileComp />
      <MacroEvolution />
      <MeasuresEvolution />
    </>
  )
}
