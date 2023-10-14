'use client'

import CreateBlankDayButton from '@/sections/day/components/CreateBlankDayButton'
import CopyLastDayButton from '@/sections/day/components/CopyLastDayButton'
import { computed } from '@preact/signals-react'

export default function DayNotFound({ selectedDay }: { selectedDay: string }) {
  return (
    <>
      <h1 className="mt-2" color="warning">
        Nenhum dado encontrado para o dia {selectedDay}
      </h1>
      <CreateBlankDayButton selectedDay={selectedDay} />
      <CopyLastDayButton
        day={computed(() => undefined)}
        selectedDay={selectedDay}
      />
    </>
  )
}
