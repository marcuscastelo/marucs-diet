'use client'

import { RefObject, useRef, useState } from 'react'
import MealList from '../../(meal)/MealList'
import { Day } from '@/model/dayModel'
import MealView, { MealViewProps } from '../../(meal)/MealView'
import { updateDay } from '@/controllers/days'
import { Alert } from 'flowbite-react'
import Show from '../../Show'
import DayMacros from '../../DayMacros'
import { MealData } from '@/model/mealModel'
import { Loaded } from '@/utils/loadable'
import { ModalRef } from '@/app/(modals)/Modal'
import FoodSearchModal from '@/app/newItem/FoodSearchModal'
import { ItemGroup } from '@/model/foodItemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import ItemGroupEditModal from '@/app/(itemGroup)/ItemGroupEditModal'
import CopyLastDayButton from './CopyLastDayButton'
import DeleteDayButton from './DeleteDayButton'
import { useRouter } from 'next/navigation'
import { getToday } from '@/utils/dateUtils'

export default function DayMeals({
  selectedDay,
  editModalId,
  dayData, // TODO: Rename all occurrences of dayData to day
  refetchDays,
  days,
}: {
  selectedDay: string
  editModalId: string
  dayData: Day | undefined
  refetchDays: () => void
  days: Loaded<Day[]>
}) {
  const router = useRouter()
  const today = getToday()
  const showingToday = today === selectedDay

  const [dayLocked, setDayLocked] = useState(!showingToday)

  const mealAddItemModalRef = useRef<ModalRef>(null)
  const foodSearchModalRef = useRef<ModalRef>(null)

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

    refetchDays()
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
        refetchDays={refetchDays}
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
      />
      <ExternalItemGroupEditModal
        dayData={dayData}
        editModalId={editModalId}
        refetchDays={refetchDays}
        foodItemGroupEditModalRef={mealAddItemModalRef}
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
      <MealList className="mt-5" mealsProps={mealProps!} />
      {/* // TODO: Avoid non-null assertion */}
      <CopyLastDayButton
        dayData={dayData!}
        days={days}
        selectedDay={selectedDay}
        refetchDays={refetchDays}
      />
      <DeleteDayButton dayData={dayData} refetchDays={refetchDays} />
    </>
  )
}

function ExternalFoodSearchModal({
  selectedMeal,
  unselect,
  foodSearchModalRef,
  dayData,
  refetchDays,
}: {
  selectedMeal: MealData | null
  unselect: () => void
  foodSearchModalRef: RefObject<ModalRef>
  dayData: Day | undefined
  refetchDays: () => void
}) {
  return (
    <FoodSearchModal
      targetName={selectedMeal?.name ?? 'ERRO: Nenhuma refeição selecionada!'}
      ref={foodSearchModalRef}
      onFinish={() => {
        console.debug('setSelectedMeal(null)')
        unselect()
        foodSearchModalRef.current?.close()
        refetchDays()
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
  refetchDays,
}: {
  editModalId: string
  foodItemGroupEditModalRef: RefObject<ModalRef>
  selectedItemGroup: ItemGroup | null
  selectedMeal: MealData | null
  unselect: () => void
  dayData: Day | undefined
  refetchDays: () => void
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

        refetchDays() // TODO: Vai dar uma merda
        unselect() // TODO: Vai dar uma merda
        foodItemGroupEditModalRef.current?.close() // TODO: Vai dar uma merda
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

        refetchDays() // TODO: Vai dar uma merda
        unselect() // TODO: Vai dar uma merda
        foodItemGroupEditModalRef.current?.close()
      }}
      onRefetch={refetchDays}
    />
  )
}
