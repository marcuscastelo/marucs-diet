'use client'

import PageLoading from '../../PageLoading'
import { upsertDay } from '@/controllers/days'
import { Alert } from 'flowbite-react'
import { mockDay } from '@/app/test/unit/(mock)/mockData'
import { useUserContext } from '@/context/users.context'
import CopyLastDayButton from './CopyLastDayButton'
import { useDaysContext } from '@/context/days.context'
import DayMeals from './DayMeals'
import TopBar from './TopBar'
import { User } from '@/model/userModel'
import { Loaded } from '@/utils/loadable'
import { Day } from '@/model/dayModel'

type PageParams = {
  params: {
    day: string
  }
}

export default function Page({ params }: PageParams) {
  const { user } = useUserContext()
  const { days, refetchDays } = useDaysContext()

  const selectedDay = params.day

  const EDIT_MODAL_ID = 'edit-modal'

  if (user.loading) {
    return <PageLoading message="Carregando usuário" />
  }

  if (user.errored) {
    return <PageLoading message="Erro ao carregar usuário" />
  }

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
        user={user}
      />
    )
  }

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={selectedDay} />
      <DayMeals
        dayData={dayData}
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
  user,
  refetchDays,
  days,
}: {
  selectedDay: string
  user: Loaded<User>
  refetchDays: () => void
  days: Loaded<Day[]>
}) {
  return (
    <>
      <Alert className="mt-2" color="warning">
        Nenhum dado encontrado para o dia {selectedDay}
      </Alert>
      <button
        className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={() => {
          upsertDay(
            mockDay(
              { owner: user.data.id, target_day: selectedDay },
              { groups: [] },
            ),
          ).then(() => {
            refetchDays()
          })
        }}
      >
        Criar dia do zero
      </button>
      <CopyLastDayButton
        dayData={undefined}
        days={days}
        refetchDays={refetchDays}
        selectedDay={selectedDay}
      />
    </>
  )
}
