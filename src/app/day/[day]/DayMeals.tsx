'use client'

import MealEditViewList from '@/app/(meal)/MealEditViewList'
import { Day } from '@/model/dayModel'
import MealEditView, { MealEditViewProps } from '@/app/(meal)/MealEditView'
import { updateDay } from '@/controllers/days'
import { Alert } from 'flowbite-react'
import DayMacros from '@/app/DayMacros'
import { Meal } from '@/model/mealModel'
import { TemplateSearchModal } from '@/app/templateSearch/TemplateSearchModal'
import { ItemGroup } from '@/model/itemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import ItemGroupEditModal from '@/app/(itemGroup)/ItemGroupEditModal'
import CopyLastDayButton from '@/app/day/[day]/CopyLastDayButton'
import DeleteDayButton from '@/app/day/[day]/DeleteDayButton'
import { useRouter } from 'next/navigation'
import { getToday } from '@/utils/dateUtils'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useUserContext } from '@/context/users.context'
import { addItemGroupToMeal } from '@/utils/dayEditor'
import {
  ReadonlySignal,
  Signal,
  computed,
  signal,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'
import { use, useEffect } from 'react'

type EditSelection = {
  meal: Meal
  itemGroup: ItemGroup
} | null

type NewItemSelection = {
  meal: Meal
} | null

const editSelection = signal<EditSelection>(null)

const newItemSelection = signal<NewItemSelection>(null)

export default function DayMeals({
  selectedDay,
  day: daySSR,
  refetchDays,
  days: daysSSR,
}: {
  selectedDay: string
  day: Day
  refetchDays: () => void
  days: Day[]
}) {
  const router = useRouter()
  const today = getToday()
  const showingToday = today === selectedDay

  const day = useSignal(daySSR)
  const days = useSignal(daysSSR)

  useEffect(() => {
    console.debug(
      `[DayMeals] <ssr-change> Setting day to ${JSON.stringify(daySSR)}`,
    )
    day.value = daySSR
  }, [daySSR, day])

  useEffect(() => {
    // console.debug(
    //   `[DayMeals] <ssr-change> Setting days to ${JSON.stringify(daysSSR)}`,
    // )
    days.value = daysSSR
  }, [daysSSR, days])

  const dayLocked = useSignal(!showingToday)

  const itemGroupEditModalVisible = useSignal(false)
  const templateSearchModalVisible = useSignal(false)

  const handleEditItemGroup = (meal: Meal, itemGroup: ItemGroup) => {
    if (dayLocked.value) {
      alert('Dia bloqueado, não é possível editar') // TODO: Change all alerts with ConfirmModal
      return
    }

    editSelection.value = { meal, itemGroup }
    itemGroupEditModalVisible.value = true
  }

  const handleUpdateMeal = async (day: Day, meal: Meal) => {
    if (dayLocked.value) {
      alert('Dia bloqueado, não é possível editar') // TODO: Change all alerts with ConfirmModal
      return
    }

    // TODO: Use DayEditor
    await updateDay(day.id, {
      ...day,
      meals: day.meals.map((m) => {
        if (m.id !== meal.id) {
          return m
        }

        return meal
      }),
    })

    refetchDays()
  }

  const handleNewItemButton = (meal: Meal) => {
    console.log('New item button clicked')
    if (dayLocked.value) {
      alert('Dia bloqueado, não é possível editar') // TODO: Change all alerts with ConfirmModal
      return
    }

    newItemSelection.value = { meal }

    console.debug('Setting selected meal to', meal)
    templateSearchModalVisible.value = true
  }

  const mealEditPropsList = computed(() =>
    day.value.meals.map((_, idx): MealEditViewProps => {
      const meal = computed(() => {
        const result = day.value.meals[idx]
        console.debug(
          `[DayMeals] <computed> Getting meal idx=${idx}, result:`,
          result,
        )
        return result
      })
      return {
        meal,
        header: (
          <MealEditView.Header
            onUpdateMeal={(meal) => handleUpdateMeal(day.value, meal)}
          />
        ),
        content: (
          <MealEditView.Content
            onEditItemGroup={(item) => handleEditItemGroup(meal.value, item)}
          />
        ),
        actions: (
          <MealEditView.Actions
            onNewItem={() => handleNewItemButton(meal.value)}
          />
        ),
      }
    }),
  )

  return (
    <>
      <ExternalTemplateSearchModal
        day={day}
        refetchDays={refetchDays}
        visible={templateSearchModalVisible}
      />
      <ExternalItemGroupEditModal
        day={day}
        refetchDays={refetchDays}
        visible={itemGroupEditModalVisible}
      />
      <DayMacros
        className="mt-3 border-b-2 border-gray-800 pb-4"
        macros={calcDayMacros(day.value)}
      />
      {!showingToday && (
        <>
          <Alert className="mt-2" color="warning">
            Mostrando refeições do dia {selectedDay}!
          </Alert>

          {dayLocked.value && (
            <>
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
                    dayLocked.value = false
                  }}
                >
                  {' '}
                  Desbloquear dia {selectedDay}
                </a>
              </Alert>
            </>
          )}
        </>
      )}
      <MealEditViewList
        className="mt-5"
        mealEditPropsList={mealEditPropsList}
      />
      <CopyLastDayButton
        day={day}
        days={days}
        selectedDay={selectedDay}
        refetchDays={refetchDays}
      />
      <DeleteDayButton day={day} refetchDays={refetchDays} />
    </>
  )
}

function ExternalTemplateSearchModal({
  visible,
  day,
  refetchDays,
}: {
  visible: Signal<boolean>
  day: ReadonlySignal<Day>
  refetchDays: () => void
}) {
  const { debug } = useUserContext()
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    if (!newItemSelection.value) {
      throw new Error('No meal selected!')
    }

    addItemGroupToMeal(day.value, newItemSelection.value.meal, newGroup, {
      onFinished: refetchDays,
    })
  }

  useSignalEffect(() => {
    if (!visible.value) {
      newItemSelection.value = null
    }
  })

  const handleFinishSearch = () => {
    newItemSelection.value = null
    visible.value = false
    refetchDays()
  }

  if (!newItemSelection.value) {
    return (
      debug && (
        <h1>ERRO ExternalTemplateSearchModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider visible={visible}>
      <TemplateSearchModal
        targetName={newItemSelection.value.meal.name}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function ExternalItemGroupEditModal({
  visible,
  day,
  refetchDays,
}: {
  visible: Signal<boolean>
  day: ReadonlySignal<Day>
  refetchDays: () => void
}) {
  const { debug } = useUserContext()

  useSignalEffect(() => {
    if (!visible.value) {
      editSelection.value = null
    }
  })

  if (editSelection.value === null) {
    return (
      debug && (
        <h1>ERRO ExternalItemGroupEditModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider visible={visible}>
      <ItemGroupEditModal
        group={computed(() => editSelection.value?.itemGroup ?? null)}
        targetMealName={
          editSelection.value.meal.name ?? 'ERROR: No meal selected'
        }
        onSaveGroup={async (group) => {
          console.debug(
            `[DayMeals] (<ItemGroupEditModal/>) Saving group: ${JSON.stringify(
              group,
            )}`,
          )
          await updateDay(day.value.id, {
            ...day.value,
            meals: day.value.meals.map((meal) => {
              if (!editSelection.value) {
                throw new Error('No meal selected!')
              }
              if (meal.id !== editSelection.value.meal.id) {
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

          // TODO: Analyze if these 3 commands are troublesome
          refetchDays() // TODO: Vai dar uma merda
          editSelection.value = null
          visible.value = false
        }}
        onDelete={async (id: ItemGroup['id']) => {
          const oldMeals = [...day.value.meals]

          // TODO: Use DayEditor
          const newMeals: Meal[] = oldMeals.map((meal) => {
            if (meal.id !== editSelection.value?.meal.id) {
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

          const newDay = { ...day.value, meals: newMeals }

          await updateDay(day.value.id, newDay)

          refetchDays() // TODO: Vai dar uma merda
          editSelection.value = null
          visible.value = false
        }}
        onRefetch={refetchDays}
      />
    </ModalContextProvider>
  )
}
