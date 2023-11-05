import { CreateBlankDayButton } from '@/sections/day-diet/components/CreateBlankDayButton'
import { CopyLastDayButton } from '@/sections/day-diet/components/CopyLastDayButton'

export default function DayNotFound(props: { selectedDay: string }) {
  return (
    <>
      <h1 class="mt-2" color="warning">
        Nenhum dado encontrado para o dia {props.selectedDay}
      </h1>
      <CreateBlankDayButton selectedDay={props.selectedDay} />
      <CopyLastDayButton
        day={() => undefined}
        selectedDay={props.selectedDay}
      />
    </>
  )
}
