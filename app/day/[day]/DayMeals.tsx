'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import MealEditViewList from '../../(meal)/MealEditViewList'
import { Day } from '@/model/dayModel'
import MealEditView, { MealEditViewProps } from '../../(meal)/MealEditView'
import { updateDay } from '@/controllers/days'
import { Alert } from 'flowbite-react'
import DayMacros from '../../DayMacros'
import { Meal } from '@/model/mealModel'
import { TemplateSearchModal } from '@/app/templateSearch/TemplateSearchModal'
import { ItemGroup } from '@/model/itemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import ItemGroupEditModal from '@/app/(itemGroup)/ItemGroupEditModal'
import CopyLastDayButton from './CopyLastDayButton'
import DeleteDayButton from './DeleteDayButton'
import { useRouter } from 'next/navigation'
import { getToday } from '@/utils/dateUtils'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useUserContext } from '@/context/users.context'
import { deepCopy } from '@/utils/deepCopy'
import { addItemGroupToMeal } from '@/utils/dayEditor'
import {
  Signal,
  effect,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export default function DayMeals({
  selectedDay,
  day,
  refetchDays,
  days,
}: {
  selectedDay: string
  day: Day
  refetchDays: () => void
  days: Day[]
}) {
  const router = useRouter()
  const today = getToday()
  const showingToday = today === selectedDay

  const dayLocked = useSignal(!showingToday)

  const itemGroupEditModalVisible = useSignal(false)
  const templateSearchModalVisible = useSignal(false)

  type EditSelection =
    | {
        meal: Meal
        itemGroup: ItemGroup
      }
    | {
        meal: null
        itemGroup: null
      }

  type NewItemSelection = {
    meal: Meal | null
  }

  const editSelection = useSignal<EditSelection>({
    meal: null,
    itemGroup: null,
  })

  const newItemSelection = useSignal<NewItemSelection>({
    meal: null,
  })

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

  const mealEditPropsList = day.meals.map(
    (meal): MealEditViewProps => ({
      meal,
      header: (
        <MealEditView.Header
          onUpdateMeal={(meal) => handleUpdateMeal(day, meal)}
        />
      ),
      content: (
        <MealEditView.Content
          onEditItemGroup={(item) => handleEditItemGroup(meal, item)}
        />
      ),
      actions: (
        <MealEditView.Actions onNewItem={() => handleNewItemButton(meal)} />
      ),
    }),
  )

  return (
    <>
      <ExternalTemplateSearchModal
        day={day}
        refetchDays={refetchDays}
        visible={templateSearchModalVisible}
        selectedMeal={newItemSelection.value.meal}
        unselect={() => {
          console.debug('TemplateSearchModal: Unselecting meal')
          newItemSelection.value = {
            meal: null,
          }
        }}
      />
      <ExternalItemGroupEditModal
        day={day}
        refetchDays={refetchDays}
        visible={itemGroupEditModalVisible}
        selectedItemGroup={deepCopy(editSelection.value.itemGroup)}
        selectedMeal={deepCopy(editSelection.value.meal)}
        unselect={() => {
          console.debug('ItemGroupEditModal: Unselecting meal and itemGroup')
          editSelection.value = {
            meal: null,
            itemGroup: null,
          }
        }}
      />
      <DayMacros
        className="mt-3 border-b-2 border-gray-800 pb-4"
        macros={calcDayMacros(day)}
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
  selectedMeal,
  unselect,
  visible,
  day,
  refetchDays,
}: {
  selectedMeal: Meal | null
  unselect: () => void
  visible: Signal<boolean>
  day: Day
  refetchDays: () => void
}) {
  const { debug } = useUserContext()
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    if (!selectedMeal) {
      throw new Error('No meal selected!')
    }

    addItemGroupToMeal(day, selectedMeal, newGroup, {
      onFinished: refetchDays,
    })
  }

  useSignalEffect(() => {
    if (!visible.value) {
      unselect()
    }
  })

  const handleFinishSearch = () => {
    unselect()
    visible.value = false
    refetchDays()
  }

  if (!selectedMeal) {
    return (
      debug && (
        <h1>ERRO ExternalTemplateSearchModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider visible={visible}>
      <TemplateSearchModal
        targetName={selectedMeal.name}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function ExternalItemGroupEditModal({
  selectedItemGroup,
  visible,
  unselect,
  selectedMeal,
  day,
  refetchDays,
}: {
  visible: Signal<boolean>
  selectedItemGroup: ItemGroup | null
  selectedMeal: Meal | null
  unselect: () => void
  day: Day
  refetchDays: () => void
}) {
  const { debug } = useUserContext()

  useSignalEffect(() => {
    if (!visible.value) {
      unselect()
    }
  })

  if (selectedMeal === null) {
    return (
      debug && (
        <h1>ERRO ExternalItemGroupEditModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider visible={visible}>
      <ItemGroupEditModal
        group={deepCopy(selectedItemGroup)}
        targetMealName={selectedMeal?.name ?? 'ERROR: No meal selected'}
        onSaveGroup={async (group) => {
          console.debug(
            `[DayMeals] (<ItemGroupEditModal/>) Saving group: ${JSON.stringify(
              group,
            )}`,
          )
          await updateDay(day.id, {
            ...day,
            meals: day.meals.map((meal) => {
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
          unselect() // TODO: Vai dar uma merda
          visible.value = false
        }}
        onDelete={async (id: ItemGroup['id']) => {
          const oldMeals = [...day.meals]

          // TODO: Use DayEditor
          const newMeals: Meal[] = oldMeals.map((meal) => {
            if (meal.id !== selectedMeal.id) {
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

          const newDay = { ...day }

          newDay.meals = newMeals

          await updateDay(day.id, newDay)

          refetchDays() // TODO: Vai dar uma merda
          unselect() // TODO: Vai dar uma merda
          visible.value = false
        }}
        onRefetch={refetchDays}
      />
    </ModalContextProvider>
  )
}
