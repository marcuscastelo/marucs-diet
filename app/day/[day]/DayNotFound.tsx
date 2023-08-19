'use client'

import { Day } from '@/model/dayModel'
import { Loaded } from '@/utils/loadable'
import CreateBlankDayButton from './CreateBlankDayButton'
import CopyLastDayButton from './CopyLastDayButton'

export default function DayNotFound({
  selectedDay,
  refetchDays,
  days,
}: {
  selectedDay: string
  refetchDays: () => void
  days: Loaded<Day[]>
}) {
  return (
    <>
      <h1 className="mt-2" color="warning">
        Nenhum dado encontrado para o dia {selectedDay}
      </h1>
      <CreateBlankDayButton
        selectedDay={selectedDay}
        refetchDays={refetchDays}
      />
      <CopyLastDayButton
        dayData={undefined}
        days={days}
        refetchDays={refetchDays}
        selectedDay={selectedDay}
      />
    </>
  )
}
