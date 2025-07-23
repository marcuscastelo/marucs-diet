import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'

type PreviousDayDetailsModalProps = {
  dayDiet: DayDiet
}

function PreviousDayDetailsModal(props: PreviousDayDetailsModalProps) {
  return (
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold mb-2">Resumo do dia</h3>
      <DayMacros dayDiet={props.dayDiet} />
      <DayMeals
        dayDiet={props.dayDiet}
        selectedDay={props.dayDiet.target_day}
        mode="summary"
      />
    </div>
  )
}

export default PreviousDayDetailsModal
