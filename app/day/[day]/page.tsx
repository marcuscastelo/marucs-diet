'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import DayMeals from '../../DayMeals'
import { Day } from '@/model/dayModel'
import Meal, { MealProps } from '../../(meal)/Meal'
import PageLoading from '../../PageLoading'
import { upsertDay, deleteDay, listDays, updateDay } from '@/controllers/days'
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
import Datepicker from 'react-tailwindcss-datepicker'
import { Alert } from 'flowbite-react'
import Show from '../../Show'
import DayMacros from '../../DayMacros'
import { MealData } from '@/model/mealModel'
import { useRouter } from 'next/navigation'
import { mockDay } from '@/app/test/unit/(mock)/mockData'
import UserSelector from '@/app/UserSelector'
import { useUser } from '@/redux/features/userSlice'
import { Loadable, Loaded } from '@/utils/loadable'
import { getToday, stringToDate } from '@/utils/dateUtils'
import { User } from '@/model/userModel'
import { ModalRef } from '@/app/(modals)/modal'
import FoodSearchModal from '@/app/newItem/FoodSearchModal'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'
import { FoodItemGroup } from '@/model/foodItemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import FoodItemGroupEditModal from '@/app/(foodItemGroup)/FoodItemGroupEditModal'

type PageParams = {
  params: {
    day: string
  }
}

export default function Page({ params }: PageParams) {
  const router = useRouter()

  const { user } = useUser()

  const selectedDay = params.day
  const today = getToday()
  const showingToday = today === selectedDay

  const [days, setDays] = useState<Loadable<Day[]>>({ loading: true })
  const [dayLocked, setDayLocked] = useState(!showingToday)

  const mealAddItemModalRef = useRef<ModalRef>(null)
  const foodSearchModalRef = useRef<ModalRef>(null)

  const EDIT_MODAL_ID = 'edit-modal'

  // TODO: Create a hook for this (useDay)
  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays({
      loading: false,
      data: days,
    })
  }

  const handleDayChange = (newValue: DateValueType) => {
    if (!newValue?.startDate) {
      router.push('/day')
      return
    }

    const dateString = newValue.startDate
    const date = stringToDate(dateString)
    const dayString = date.toISOString().split('T')[0] // TODO: retriggered: use dateUtils when this is understood
    router.push(`/day/${dayString}`)
  }

  useEffect(() => {
    if (user.loading) {
      return
    }

    fetchDays(user.data.id)
  }, [user])

  if (user.loading) {
    return <PageLoading message="Carregando usuário" />
  }

  if (days.loading) {
    return <PageLoading message="Carregando dias" />
  }

  const dayData = days.data.find((day) => day.target_day === selectedDay)

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <TopBar selectedDay={selectedDay} handleDayChange={handleDayChange} />
      <Show when={!selectedDay}>
        <Alert className="mt-2" color="warning">
          Selecione um dia
        </Alert>
      </Show>

      <Show when={!!selectedDay && !(dayData !== undefined)}>
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
              fetchDays(user.data.id)
            })
          }}
        >
          Criar dia do zero
        </button>
        <CopyLastDayButton
          // TODO: avoid null assertion
          dayData={dayData}
          days={days}
          fetchDays={fetchDays}
          selectedDay={selectedDay}
          user={user}
        />
      </Show>

      <Show
        when={selectedDay !== undefined && dayData !== undefined && !dayData}
      >
        <Alert className="mt-2" color="warning">
          Dia encontrado, mas sem dados {selectedDay}
        </Alert>
        ;
      </Show>

      {dayData !== undefined && (
        <DayContent
          dayData={dayData}
          editModalId={EDIT_MODAL_ID}
          mealAddItemModalRef={mealAddItemModalRef}
          foodSearchModalRef={foodSearchModalRef}
          selectedDay={selectedDay}
          dayLocked={dayLocked}
          fetchDays={fetchDays}
          router={router}
          setDayLocked={setDayLocked}
          showingToday={showingToday}
          today={today}
          user={user}
          days={days}
        />
      )}
    </div>
  )
}

const TopBar = ({
  selectedDay,
  handleDayChange,
}: {
  selectedDay: string
  handleDayChange: (day: DateValueType) => void
}) => (
  <>
    <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
      <div className="flex-1">
        <Datepicker
          asSingle={true}
          useRange={false}
          readOnly={true}
          value={{
            startDate: selectedDay,
            endDate: selectedDay,
          }}
          onChange={handleDayChange}
        />
      </div>

      <div className="flex justify-end">
        <UserSelector />
      </div>
    </div>
  </>
)

function DayContent({
  selectedDay,
  editModalId,
  mealAddItemModalRef: foodItemGroupEditModalRef,
  foodSearchModalRef,
  dayData, // TODO: Rename all occurrences of dayData to day
  fetchDays,
  user,
  showingToday,
  dayLocked,
  today,
  router,
  setDayLocked,
  days,
}: {
  selectedDay: string
  editModalId: string
  mealAddItemModalRef: RefObject<ModalRef>
  foodSearchModalRef: RefObject<ModalRef>
  dayData: Day | undefined
  fetchDays: (userId: User['id']) => Promise<void>
  user: Loaded<User>
  showingToday: boolean
  dayLocked: boolean
  today: string
  router: AppRouterInstance
  setDayLocked: (locked: boolean) => void
  days: Loaded<Day[]>
}) {
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null)
  const [selectedItemGroup, setSelectedItemGroup] =
    useState<FoodItemGroup | null>(null)

  const onEditItemGroup = (meal: MealData, itemGroup: FoodItemGroup) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    console.debug('setSelectedMeal(meal)')
    setSelectedMeal(meal)
    console.debug('setSelectedMealItem(mealItem)')
    setSelectedItemGroup(itemGroup)
    foodItemGroupEditModalRef.current?.showModal()
  }

  const onUpdateMeal = async (dayData: Day, meal: MealData) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    // TODO: Avoid non-null assertion
    await updateDay(dayData.id!, {
      // TODO: remove !
      ...dayData,
      meals: dayData.meals.map((m) => {
        if (m.id !== meal.id) {
          return m
        }

        return meal
      }),
    })

    await fetchDays(user.data.id)
  }

  const handleNewItemButton = (meal: MealData) => {
    console.log('New item button clicked')
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    console.debug('setSelectedMealItem(null)')
    setSelectedItemGroup(null)
    console.debug('Setting selected meal to', meal)
    console.debug('setSelectedMeal(meal)')
    setSelectedMeal(meal)
    console.debug('foodSearchModalRef', foodSearchModalRef)
    foodSearchModalRef.current?.showModal()
  }

  const mealProps = dayData?.meals.map(
    (meal): MealProps => ({
      mealData: meal,
      header: (
        <Meal.Header onUpdateMeal={(meal) => onUpdateMeal(dayData, meal)} />
      ),
      content: (
        <Meal.Content onEditItemGroup={(item) => onEditItemGroup(meal, item)} />
      ),
      actions: <Meal.Actions onNewItem={() => handleNewItemButton(meal)} />,
    }),
  )

  return (
    <>
      <FoodSearchModal
        targetName={selectedMeal?.name ?? 'ERRO: Nenhuma refeição selecionada!'}
        ref={foodSearchModalRef}
        onFinish={() => {
          console.debug('setSelectedMeal(null)')
          setSelectedMeal(null)
          foodSearchModalRef.current?.close()
          fetchDays(user.data.id)
        }}
        onVisibilityChange={(visible) => {
          if (!visible) {
            console.debug('setSelectedMeal(null)')
            setSelectedMeal(null)
          }
        }}
        onNewFoodItem={async (item) => {
          // TODO: Create a proper onNewFoodItem function
          const oldMeal = selectedMeal! // TODO: Avoid non-null assertion

          const newMeal: MealData = {
            ...oldMeal,
            groups: [
              ...oldMeal.groups,
              {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                type: 'simple',
                items: [{ ...item }],
              } satisfies FoodItemGroup,
            ] satisfies MealData['groups'],
          }

          const newDay: Day = {
            ...dayData!,
            meals: dayData!.meals.map((m) => {
              // TODO: Avoid non-null assertion
              if (m.id === oldMeal.id) {
                return newMeal
              }

              return m
            }),
          }

          await updateDay(dayData!.id, newDay)
        }}
      />
      <FoodItemGroupEditModal
        modalId={editModalId}
        ref={foodItemGroupEditModalRef}
        group={selectedItemGroup}
        targetMealName={selectedMeal?.name ?? 'ERROR: No meal selected'}
        onSaveGroup={async (group) => {
          console.debug('FoodItemGroupEditModal onApply, received group', group)
          // TODO: Avoid non-null assertion
          await updateDay(dayData!.id, {
            ...dayData!,
            meals: dayData!.meals.map((meal) => {
              if (meal.id !== selectedMeal!.id) {
                return meal
              }
              console.debug('Found meal to update, meal name: ', meal.name)
              const groups = meal.groups
              const changePos = groups.findIndex((i) => i.id === group.id)

              console.debug('Index of group to update: ', changePos)

              if (changePos === -1) {
                throw new Error(
                  'Group not found! Searching for id: ' + group.id,
                )
              }

              console.debug(
                'Found group to update, group name: ',
                groups[changePos].name,
              )
              groups[changePos] = group

              console.debug('Updated groups: ', JSON.stringify(groups, null, 2))

              return {
                ...meal,
                groups,
              }
            }),
          })

          await fetchDays(user.data.id)

          console.debug('setSelectedMeal(null)')
          setSelectedMeal(null)
          console.debug('setSelectedMealItem(null)')
          setSelectedItemGroup(null)
          foodItemGroupEditModalRef.current?.close()
        }}
        onDelete={async (id: FoodItemGroup['id']) => {
          // TODO: Avoid non-null assertion
          await updateDay(dayData!.id, {
            ...dayData!,
            meals: dayData!.meals.map((meal) => {
              if (meal.id !== selectedMeal!.id) {
                return meal
              }

              const items = meal.groups
              const changePos = items.findIndex((i) => i.id === id)

              items.splice(changePos, 1)

              return {
                ...meal,
                groups: items,
              }
            }),
          })

          await fetchDays(user.data.id)

          console.debug('setSelectedMeal(null)')
          setSelectedMeal(null)
          console.debug('setSelectedMealItem(null)')
          setSelectedItemGroup(null)
          foodItemGroupEditModalRef.current?.close()
        }}
        onVisibilityChange={(visible) => {
          if (!visible) {
            console.debug('setSelectedMeal(null)')
            setSelectedMeal(null)
            console.debug('setSelectedMealItem(null)')
            setSelectedItemGroup(null)
          }
        }}
        onRefetch={() => fetchDays(user.data.id)}
      />
      <DayMacros
        className="mt-3 border-b-2 border-gray-800 pb-4"
        // TODO: Avoid non-null assertion
        macros={calcDayMacros(dayData!)}
      />
      <Show when={!showingToday}>
        <Alert className="mt-2" color="warning">
          Mostrando refeições do dia {selectedDay}!
        </Alert>
        <Show when={dayLocked}>
          <Alert className="mt-2 outline" color="info">
            Hoje é dia <b>{today}</b>{' '}
            <a
              className="font-bold text-blue-500 hover:cursor-pointer "
              onClick={() => {
                router.push('/day/' + today)
              }}
            >
              Mostrar refeições de hoje
            </a>{' '}
            ou{' '}
            <a
              className="font-bold text-red-600 hover:cursor-pointer "
              onClick={() => {
                setDayLocked(false)
              }}
            >
              {' '}
              Desbloquear dia {selectedDay}
            </a>
          </Alert>
        </Show>
      </Show>
      {/* // TODO: Avoid non-null assertion */}
      <DayMeals className="mt-5" mealsProps={mealProps!} />
      {/* // TODO: Avoid non-null assertion */}
      <CopyLastDayButton
        dayData={dayData!}
        days={days}
        user={user}
        selectedDay={selectedDay}
        fetchDays={fetchDays}
      />
      <button
        className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
        onClick={async () => {
          if (!confirm('Tem certeza que deseja excluir este dia?')) {
            return
          }
          // TODO: Avoid non-null assertion
          await deleteDay(dayData!.id)
          await fetchDays(user.data.id)
        }}
      >
        PERIGO: Excluir dia
      </button>
    </>
  )
}

function CopyLastDayButton({
  days,
  user,
  dayData,
  selectedDay,
  fetchDays,
}: {
  days: Loaded<Day[]>
  user: Loaded<User>
  dayData: Day | null | undefined
  selectedDay: string
  fetchDays: (userId: User['id']) => Promise<void>
}) {
  // TODO: Remove duplicate check of user and days loading
  if (days.loading || user.loading) return <>LOADING</>

  const lastDayIdx = days.data.findLastIndex(
    (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
  )
  if (lastDayIdx === /* TODO: Check if equality is a bug */ -1) {
    return (
      <button
        className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={() =>
          alert(`Não foi possível encontrar um dia anterior a ${selectedDay}`)
        }
      >
        Copiar dia anterior: não encontrado!
      </button>
    )
  }

  return (
    <button
      className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
      onClick={async () => {
        if (dayData !== undefined) {
          if (
            confirm(
              'Tem certeza que deseja excluir este dia e copiar o dia anterior?',
            )
          ) {
            // TODO: Avoid non-null assertion
            await deleteDay(dayData!.id)
          }
        }

        const lastDayIdx = days.data.findLastIndex(
          (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
        )
        if (lastDayIdx === /* TODO: Check if equality is a bug */ -1) {
          alert('Não foi possível encontrar um dia anterior')
          return
        }

        upsertDay({
          ...days.data[lastDayIdx],
          target_day: selectedDay,
          id: dayData?.id,
        }).then(() => {
          fetchDays(user.data.id)
        })
      }}
    >
      {/* //TODO: retriggered: copiar qualquer dia */}
      Copiar dia anterior ({days.data[lastDayIdx].target_day})
    </button>
  )
}
