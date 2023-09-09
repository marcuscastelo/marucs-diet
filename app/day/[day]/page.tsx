import TopBar from './TopBar'
import { Day } from '@/model/dayModel'
import { listDays } from '@/controllers/days'
import { revalidatePath } from 'next/cache'
import DayNotFound from './DayNotFound'
import DayMeals from './DayMeals'
import { getUser } from '@/actions/user'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
type PageParams = {
  params: {
    day: string
  }
}

export default async function Page({ params }: PageParams) {
  console.debug(`[DayPage] Rendering day ${params.day}`)

  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário não encontrado</h1>
  }

  const days: Day[] = await listDays(userId)

  const refetchDays = async () => {
    'use server'
    revalidatePath(`/day/${params.day}`)
  }

  const selectedDay = params.day

  const day = days.find((day) => day.target_day === selectedDay)

  if (!selectedDay) {
    return (
      // TODO: Use flowbite-react Alert component
      <h1 className="mt-2" color="warning">
        Selecione um dia
      </h1>
    )
  }

  if (!day) {
    return (
      <>
        <TopBar selectedDay={selectedDay} />

        <DayNotFound
          days={days}
          refetchDays={refetchDays}
          selectedDay={selectedDay}
        />
      </>
    )
  }

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={selectedDay} />
      <DayMeals
        day={day}
        selectedDay={selectedDay}
        refetchDays={refetchDays} // TODO: usePathname hook to get current path
        days={days}
      />
    </div>
  )
}
