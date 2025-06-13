import { format } from 'date-fns'
import { createSignal } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import PreviousDayCardActions from '~/sections/day-diet/components/PreviousDayCardActions'
import PreviousDayDetailsModal from '~/sections/day-diet/components/PreviousDayDetailsModal'

type PreviousDayCardProps = {
  dayDiet: DayDiet
  copying: boolean
  copyingDay: string | null
  onCopy: (day: string) => void
}

function PreviousDayCard(props: PreviousDayCardProps) {
  const [showDetails, setShowDetails] = createSignal(false)
  return (
    <div class="border rounded p-3 flex flex-col gap-2">
      <div class="font-semibold">
        {format(new Date(props.dayDiet.target_day), 'dd/MM/yyyy')}
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
