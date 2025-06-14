import { format } from 'date-fns'
import { createSignal } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import PreviousDayCardActions from '~/sections/day-diet/components/PreviousDayCardActions'
import PreviousDayDetailsModal from '~/sections/day-diet/components/PreviousDayDetailsModal'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import { calcCalories, calcDayMacros } from '~/shared/utils/macroMath'

type PreviousDayCardProps = {
  dayDiet: DayDiet
  copying: boolean
  copyingDay: string | null
  onCopy: (day: string) => void
}

function PreviousDayCard(props: PreviousDayCardProps) {
  const [showDetails, setShowDetails] = createSignal(false)
  const macros = () => calcDayMacros(props.dayDiet)
  const calories = () => calcCalories(macros())
  return (
    <div class="border rounded p-3 flex flex-col gap-2">
      <div class="flex justify-between">
        <div class="font-semibold">
          {format(new Date(props.dayDiet.target_day), 'dd/MM/yyyy')}
        </div>
        <div class="flex gap-2 text-sm text-gray-600 justify-between px-2 items-center">
          <div>
            <MacroNutrientsView macros={macros()} />
          </div>
          <span class="ml-2 text-sm text-white">
            {calories().toFixed(2)} kcal
          </span>
        </div>
      </div>
      <PreviousDayCardActions
        dayDiet={props.dayDiet}
        copying={props.copying}
        copyingDay={props.copyingDay}
        onShowDetails={() => setShowDetails(true)}
        onCopy={props.onCopy}
      />

      <PreviousDayDetailsModal
        visible={showDetails()}
        setVisible={setShowDetails}
        dayDiet={props.dayDiet}
      />
    </div>
  )
}

export default PreviousDayCard
