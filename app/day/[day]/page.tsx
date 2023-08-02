'use client'

import { useEffect, useRef, useState } from 'react'
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
import { MealItemData } from '@/model/mealItemModel'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { useRouter } from 'next/navigation'
import MealItemAddModal from '@/app/MealItemAddModal'
import { mockDay, mockItem, mockMeal } from '@/app/test/unit/(mock)/mockData'
import UserSelector from '@/app/UserSelector'
import { useUser } from '@/redux/features/userSlice'
import { Loadable } from '@/utils/loadable'
import { getToday, stringToDate } from '@/utils/dateUtils'
import { User } from '@/model/userModel'
import { ModalRef } from '@/app/(modals)/modal'

// TODO: Set context type
export default function Page(context: any) {
  const router = useRouter()

  const { user } = useUser()

  const selectedDay = context.params.day as string // TODO: retriggered: type-safe this
  const today = getToday()
  const showingToday =
    today === /* TODO: Check if equality is a bug */ selectedDay

  const [days, setDays] = useState<Loadable<Day[]>>({ loading: true })
  const [dayLocked, setDayLocked] = useState(!showingToday)

  const [selectedMeal, setSelectedMeal] = useState(
    mockMeal({ name: 'BUG: selectedMeal not set' }),
  )
  const [selectedMealItem, setSelectedMealItem] = useState(
    mockItem({ quantity: 666 }),
  )

  const mealAddItemModalRef = useRef<ModalRef>(null)

  const editModalId = 'edit-modal'

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

  const hasData = days.data.some(
    (day) =>
      day.target_day === /* TODO: Check if equality is a bug */ selectedDay,
  )
  const dayData = days.data.find(
    (day) =>
      day.target_day === /* TODO: Check if equality is a bug */ selectedDay,
  )

  const onEditMealItem = (meal: MealData, mealItem: MealItemData) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    setSelectedMeal(meal)
    setSelectedMealItem(mealItem)

    mealAddItemModalRef.current?.showModal()
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
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    router.push(`/newItem/${selectedDay}/${meal.id}`)
  }

  const mealProps = dayData?.meals.map(
    (meal): MealProps => ({
      mealData: meal,
      header: (
        <Meal.Header onUpdateMeal={(meal) => onUpdateMeal(dayData, meal)} />
      ),
      content: (
        <Meal.Content onEditItem={(item) => onEditMealItem(meal, item)} />
      ),
      actions: <Meal.Actions onNewItem={() => handleNewItemButton(meal)} />,
    }),
  )

  const mealItemMacros = (mealItem: MealItemData): MacroNutrientsData => {
    const macros = mealItem.food.macros
    return {
      carbs: (macros.carbs * mealItem.quantity) / 100,
      protein: (macros.protein * mealItem.quantity) / 100,
      fat: (macros.fat * mealItem.quantity) / 100,
    }
  }

  const mealMacros = (meal: MealData): MacroNutrientsData => {
    return meal.items.reduce(
      (acc, item) => {
        const itemMacros = mealItemMacros(item)
        acc.carbs += itemMacros.carbs
        acc.protein += itemMacros.protein
        acc.fat += itemMacros.fat
        return acc
      },
      {
        carbs: 0,
        protein: 0,
        fat: 0,
      },
    )
  }

  const dayMacros = dayData?.meals.reduce(
    (acc, meal): MacroNutrientsData => {
      const mm = mealMacros(meal)
      acc.carbs += mm.carbs
      acc.protein += mm.protein
      acc.fat += mm.fat
      return acc
    },
    {
      carbs: 0,
      protein: 0,
      fat: 0,
    },
  )

  function CopyLastDayButton() {
    // TODO: retriggered: improve this code
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
      return
    }

    return (
      <button
        className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={async () => {
          if (hasData) {
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

  return (
    <div className="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
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

      <Show when={!selectedDay}>
        <Alert className="mt-2" color="warning">
          Selecione um dia
        </Alert>
      </Show>

      <Show when={!!selectedDay && !hasData}>
        <Alert className="mt-2" color="warning">
          Nenhum dado encontrado para o dia {selectedDay}
        </Alert>
        <button
          className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
          onClick={() => {
            upsertDay(
              mockDay(
                { owner: user.data.id, target_day: selectedDay },
                { items: [] },
              ),
            ).then(() => {
              fetchDays(user.data.id)
            })
          }}
        >
          Criar dia do zero
        </button>
        <CopyLastDayButton />
      </Show>

      <Show when={!!selectedDay && hasData && !dayData}>
        <Alert className="mt-2" color="warning">
          Dia encontrado, mas sem dados {selectedDay}
        </Alert>
        ;
      </Show>

      <Show when={!!selectedDay && hasData && !!dayData && !mealProps}>
        <Alert className="mt-2" color="warning">
          Dia encontrado, mas sem dados de refeições {selectedDay}
        </Alert>
        ;
      </Show>

      <Show
        when={
          !!selectedDay && hasData && !!dayData && !!mealProps && !dayMacros
        }
      >
        <Alert className="mt-2" color="warning">
          Dia encontrado, mas sem dados de macros {selectedDay}
        </Alert>
        ;
      </Show>

      <Show when={hasData}>
        <MealItemAddModal
          modalId={editModalId}
          ref={mealAddItemModalRef}
          itemData={{
            id: selectedMealItem.id,
            food: selectedMealItem.food,
            quantity: selectedMealItem.quantity,
          }}
          meal={selectedMeal}
          show={false}
          onApply={async (item) => {
            // TODO: Avoid non-null assertion
            await updateDay(dayData!.id, {
              ...dayData!,
              meals: dayData!.meals.map((meal) => {
                if (meal.id !== selectedMeal.id) {
                  return meal
                }

                const items = meal.items
                const changePos = items.findIndex(
                  (i) =>
                    i.id === /* TODO: Check if equality is a bug */ item.id,
                )

                items[changePos] = item

                return {
                  ...meal,
                  items,
                }
              }),
            })

            await fetchDays(user.data.id)

            mealAddItemModalRef.current?.close()
          }}
          onDelete={async (id: MealItemData['id']) => {
            // TODO: Avoid non-null assertion
            await updateDay(dayData!.id, {
              ...dayData!,
              meals: dayData!.meals.map((meal) => {
                if (meal.id !== selectedMeal.id) {
                  return meal
                }

                const items = meal.items
                const changePos = items.findIndex(
                  (i) => i.id === /* TODO: Check if equality is a bug */ id,
                )

                items.splice(changePos, 1)

                return {
                  ...meal,
                  items,
                }
              }),
            })

            await fetchDays(user.data.id)

            mealAddItemModalRef.current?.close()
          }}
        />
        <DayMacros
          className="mt-3 border-b-2 border-gray-800 pb-4"
          // TODO: Avoid non-null assertion
          macros={dayMacros!}
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
        <CopyLastDayButton />
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
      </Show>
    </div>
  )
}
