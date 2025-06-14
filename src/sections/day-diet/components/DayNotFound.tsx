import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import { CreateBlankDayButton } from '~/sections/day-diet/components/CreateBlankDayButton'

export default function DayNotFound(props: { selectedDay: string }) {
  return (
    <>
      <h1 class="mt-2 text-warning font-bold text-lg text-center">
        Nenhuma dieta encontrada para hoje
      </h1>
      <div class="flex flex-col gap-2 mt-4">
        <CreateBlankDayButton selectedDay={props.selectedDay} />
        <CopyLastDayButton
          dayDiet={() => undefined}
          selectedDay={props.selectedDay}
        />
      </div>
    </>
  )
}
