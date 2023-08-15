'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import DayMeals from '../../DayMeals'
import { Day } from '@/model/dayModel'
import MealView, { MealViewProps } from '../../(meal)/MealView'
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
import { Loadable, Loaded } from '@/utils/loadable'
import { getToday, stringToDate } from '@/utils/dateUtils'
import { User } from '@/model/userModel'
import { ModalRef } from '@/app/(modals)/Modal'
import FoodSearchModal from '@/app/newItem/FoodSearchModal'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'
import { ItemGroup } from '@/model/foodItemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import ItemGroupEditModal from '@/app/(itemGroup)/ItemGroupEditModal'
import { useUserContext } from '@/context/users.context'
import CopyLastDayButton from './CopyLastDayButton'
import DeleteDayButton from './DeleteDayButton'

type PageParams = {
  params: {
    day: string
  }
}

export default function Page({ params }: PageParams) {
  const router = useRouter()

  const { user } = useUserContext()

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
      errored: false,
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
    if (user.loading || user.errored) {
      return
    }

    fetchDays(user.data.id)
  }, [user])

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
  const { debug } = useUserContext()

  type Selection = {
    meal: MealData | null
    itemGroup: ItemGroup | null
    origin: 'foodSearch' | 'mealItemEdit' | 'none'
  }

  const [selection, setSelection] = useState<Selection>({
    meal: null,
    itemGroup: null,
    origin: 'none',
  })

  const onEditItemGroup = (meal: MealData, itemGroup: ItemGroup) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    console.debug('setSelectedMeal(meal)')
    console.debug('setSelectedMealItem(mealItem)')

    if (selection.origin !== 'none') {
      console.error('Selection origin is not none, but ', selection.origin)
      alert('Erro ao editar item, tente novamente')
      return
    }

    setSelection({
      meal,
      itemGroup,
      origin: 'mealItemEdit',
    })
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

    if (selection.origin !== 'none') {
      console.error('Selection origin is not none, but ', selection.origin)
      alert('Erro ao adicionar item, tente novamente')
      return
    }

    setSelection({
      meal,
      itemGroup: null,
      origin: 'foodSearch',
    })

    console.debug('Setting selected meal to', meal)
    foodSearchModalRef.current?.showModal()
  }

  const mealProps = dayData?.meals.map(
    (meal): MealViewProps => ({
      mealData: meal,
      header: (
        <MealView.Header onUpdateMeal={(meal) => onUpdateMeal(dayData, meal)} />
      ),
      content: (
        <MealView.Content
          onEditItemGroup={(item) => onEditItemGroup(meal, item)}
        />
      ),
      actions: <MealView.Actions onNewItem={() => handleNewItemButton(meal)} />,
    }),
  )

  return (
    <>
      <ExternalFoodSearchModal
        dayData={dayData}
        fetchDays={fetchDays}
        foodSearchModalRef={foodSearchModalRef}
        selectedMeal={selection.meal}
        unselect={() => {
          if (selection.origin !== 'foodSearch') {
            console.error(
              'Selection origin is not foodSearch, but ',
              selection.origin,
            )
            return
          }

          setSelection({
            meal: null,
            itemGroup: null,
            origin: 'none',
          })
        }}
        user={user}
      />
      <ExternalItemGroupEditModal
        dayData={dayData}
        editModalId={editModalId}
        fetchDays={fetchDays}
        foodItemGroupEditModalRef={foodItemGroupEditModalRef}
        selectedItemGroup={selection.itemGroup}
        selectedMeal={selection.meal}
        unselect={() => {
          if (selection.origin !== 'mealItemEdit') {
            console.error(
              'Selection origin is not mealItemEdit, but ',
              selection.origin,
            )
            return
          }

          setSelection({
            meal: null,
            itemGroup: null,
            origin: 'none',
          })
        }}
        user={user}
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
      <DeleteDayButton dayData={dayData} fetchDays={fetchDays} user={user} />
    </>
  )
}

function ExternalFoodSearchModal({
  selectedMeal,
  unselect,
  foodSearchModalRef,
  dayData,
  fetchDays,
  user,
}: {
  selectedMeal: MealData | null
  unselect: () => void
  foodSearchModalRef: RefObject<ModalRef>
  dayData: Day | undefined
  fetchDays: (userId: User['id']) => Promise<void>
  user: Loaded<User>
}) {
  return (
    <FoodSearchModal
      targetName={selectedMeal?.name ?? 'ERRO: Nenhuma refeição selecionada!'}
      ref={foodSearchModalRef}
      onFinish={() => {
        console.debug('setSelectedMeal(null)')
        unselect()
        foodSearchModalRef.current?.close()
        fetchDays(user.data.id)
      }}
      onVisibilityChange={(visible) => {
        if (!visible) {
          console.debug('setSelectedMeal(null)')
          unselect()
        }
      }}
      onNewItemGroup={async (newGroup) => {
        // TODO: Create a proper onNewFoodItem function
        const oldMeal = selectedMeal! // TODO: Avoid non-null assertion

        const newMeal: MealData = {
          ...oldMeal,
          groups: [...oldMeal.groups, newGroup] satisfies MealData['groups'],
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
  )
}

function ExternalItemGroupEditModal({
  editModalId,
  foodItemGroupEditModalRef,
  selectedItemGroup,
  unselect,
  selectedMeal,
  dayData,
  fetchDays,
  user,
}: {
  editModalId: string
  foodItemGroupEditModalRef: RefObject<ModalRef>
  selectedItemGroup: ItemGroup | null
  selectedMeal: MealData | null
  unselect: () => void
  dayData: Day | undefined
  fetchDays: (userId: User['id']) => Promise<void>
  user: Loaded<User>
}) {
  return (
    <ItemGroupEditModal
      modalId={editModalId}
      ref={foodItemGroupEditModalRef}
      group={selectedItemGroup}
      targetMealName={selectedMeal?.name ?? 'ERROR: No meal selected'}
      onSaveGroup={async (group) => {
        console.debug('ItemGroupEditModal onApply, received group', group)
        // TODO: Avoid non-null assertion
        await updateDay(dayData!.id, {
          ...dayData!,
          meals: dayData!.meals.map((meal) => {
            if (!selectedMeal) {
              throw new Error('No meal selected!')
            }
            if (meal.id !== selectedMeal.id) {
              return meal
            }
            console.debug('Found meal to update, meal name: ', meal.name)
            const groups = meal.groups
            const changePos = groups.findIndex((i) => i.id === group.id)

            console.debug('Index of group to update: ', changePos)

            if (changePos === -1) {
              throw new Error('Group not found! Searching for id: ' + group.id)
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

        unselect()
        foodItemGroupEditModalRef.current?.close()
      }}
      onDelete={async (id: ItemGroup['id']) => {
        const oldMeals = [...dayData!.meals]

        const newMeals: MealData[] = oldMeals.map((meal) => {
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
        })

        const newDay = { ...dayData! }

        newDay.meals = newMeals

        // TODO: Avoid non-null assertion
        await updateDay(dayData!.id, newDay)

        await fetchDays(user.data.id)

        unselect()
        foodItemGroupEditModalRef.current?.close()
      }}
      onRefetch={() => fetchDays(user.data.id)}
    />
  )
}
