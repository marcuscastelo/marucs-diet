'use client'

import PageLoading from '../../PageLoading'
import { Alert } from 'flowbite-react'
import CopyLastDayButton from './CopyLastDayButton'
import { useDaysContext } from '@/context/days.context'
import DayMeals from './DayMeals'
import TopBar from './TopBar'
import { Loaded } from '@/utils/loadable'
import { Day } from '@/model/dayModel'
import CreateBlankDayButton from './CreateBlankDayButton'

type PageParams = {
  params: {
    day: string
  }
}

export default function Page({ params }: PageParams) {
  const { days, refetchDays } = useDaysContext()

  const selectedDay = params.day

  const EDIT_MODAL_ID = 'edit-modal'

  if (days.loading) {
    return <PageLoading message="Carregando dias" />
  }

  if (days.errored) {
    return <PageLoading message="Erro ao carregar dias" />
  }

  const dayData = days.data.find((day) => day.target_day === selectedDay)

  if (!selectedDay) {
    return (
      <Alert className="mt-2" color="warning">
        Selecione um dia
      </Alert>
    )
  }

  if (!dayData) {
    return (
      <DayNotFound
        days={days}
        refetchDays={refetchDays}
        selectedDay={selectedDay}
      />
    )
  }

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={selectedDay} />
      <DayMeals
        day={dayData}
        editModalId={EDIT_MODAL_ID}
        selectedDay={selectedDay}
        refetchDays={refetchDays}
        days={days}
      />
    </div>
  )
}

function DayNotFound({
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
      <Alert className="mt-2" color="warning">
        Nenhum dado encontrado para o dia {selectedDay}
      </Alert>
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
