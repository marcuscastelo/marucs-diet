import PageLoading from '../../PageLoading'
import TopBar from './TopBar'
import { Loadable } from '@/utils/loadable'
import { Day } from '@/model/dayModel'
import { listDays } from '@/controllers/days'
import { revalidatePath } from 'next/cache'
import DayNotFound from './DayNotFound'
import DayMeals from './DayMeals'
import { cookies } from 'next/dist/client/components/headers'
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
  // TODO: Remove Loadable and use days directly

  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário não encontrado</h1>
  }

  const days: Loadable<Day[]> = {
    loading: false,
    errored: false,
    data: await listDays(userId), // TODO: Get user id from cookies
  }

  const refetchDays = async () => {
    'use server'
    revalidatePath(`/day/${params.day}`)
  }

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
      // TODO: Use flowbite-react Alert component
      <h1 className="mt-2" color="warning">
        Selecione um dia
      </h1>
    )
  }

  if (!dayData) {
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
      Cookies: {JSON.stringify(await getUser())}
      <DayMeals
        day={dayData}
        editModalId={EDIT_MODAL_ID}
        selectedDay={selectedDay}
        refetchDays={refetchDays} // TODO: usePathname hook to get current path
        days={days}
      />
    </div>
  )
}
