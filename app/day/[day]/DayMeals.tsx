'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import MealList from '../../(meal)/MealList'
import { Day } from '@/model/dayModel'
import MealView, { MealViewProps } from '../../(meal)/MealView'
import { updateDay } from '@/controllers/days'
import { Alert } from 'flowbite-react'
import Show from '../../Show'
import DayMacros from '../../DayMacros'
import { MealData } from '@/model/mealModel'
import { Loaded } from '@/utils/loadable'
import FoodSearchModal from '@/app/newItem/FoodSearchModal'
import { ItemGroup } from '@/model/foodItemGroupModel'
import { calcDayMacros } from '@/utils/macroMath'
import ItemGroupEditModal from '@/app/(itemGroup)/ItemGroupEditModal'
import CopyLastDayButton from './CopyLastDayButton'
import DeleteDayButton from './DeleteDayButton'
import { useRouter } from 'next/navigation'
import { getToday } from '@/utils/dateUtils'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useUserContext } from '@/context/users.context'

export default function DayMeals({
  selectedDay,
  editModalId,
  day, // TODO: Rename all occurrences of dayData to day
  refetchDays,
  days,
}: {
  selectedDay: string
  editModalId: string
  day: Day
  refetchDays: () => void
  days: Loaded<Day[]>
}) {
  const router = useRouter()
  const today = getToday()
  const showingToday = today === selectedDay

  const [dayLocked, setDayLocked] = useState(!showingToday)

  const [itemGroupEditModalVisible, setItemGroupEditModalVisible] =
    useState(false)
  const [foodSearchModalVisible, setFoodSearchModalVisible] = useState(false)

  type EditSelection =
    | {
        meal: MealData
        itemGroup: ItemGroup
      }
    | {
        meal: null
        itemGroup: null
      }

  type NewItemSelection = {
    meal: MealData | null
  }

  const [editSelection, setEditSelection] = useState<EditSelection>({
    meal: null,
    itemGroup: null,
  })

  const [newItemSelection, setNewItemSelection] = useState<NewItemSelection>({
    meal: null,
  })

  const onEditItemGroup = (meal: MealData, itemGroup: ItemGroup) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    setEditSelection({ meal, itemGroup })
    setItemGroupEditModalVisible(true)
  }

  const onUpdateMeal = async (day: Day, meal: MealData) => {
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

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

  const handleNewItemButton = (meal: MealData) => {
    console.log('New item button clicked')
    if (dayLocked) {
      alert('Dia bloqueado, não é possível editar')
      return
    }

    setNewItemSelection({ meal })

    console.debug('Setting selected meal to', meal)
    setFoodSearchModalVisible(true)
  }

  const mealProps = day.meals.map(
    (meal): MealViewProps => ({
      mealData: meal,
      header: (
        <MealView.Header onUpdateMeal={(meal) => onUpdateMeal(day, meal)} />
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
        day={day}
        refetchDays={refetchDays}
        visible={foodSearchModalVisible}
        setVisible={setFoodSearchModalVisible}
        selectedMeal={newItemSelection.meal}
        unselect={() => {
          console.debug('FoodSearchModal: Unselecting meal')
          setNewItemSelection({
            meal: null,
          })
        }}
      />
      <ExternalItemGroupEditModal
        dayData={day}
        editModalId={editModalId}
        refetchDays={refetchDays}
        visible={itemGroupEditModalVisible}
        setVisible={setItemGroupEditModalVisible}
        selectedItemGroup={editSelection.itemGroup}
        selectedMeal={editSelection.meal}
        unselect={() => {
          console.debug('ItemGroupEditModal: Unselecting meal and itemGroup')
          setEditSelection({
            meal: null,
            itemGroup: null,
          })
        }}
      />
      <DayMacros
        className="mt-3 border-b-2 border-gray-800 pb-4"
        macros={calcDayMacros(day)}
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
      <MealList className="mt-5" mealsProps={mealProps} />
      <CopyLastDayButton
        dayData={day}
        days={days}
        selectedDay={selectedDay}
        refetchDays={refetchDays}
      />
      <DeleteDayButton dayData={day} refetchDays={refetchDays} />
    </>
  )
}

function ExternalFoodSearchModal({
  selectedMeal,
  unselect,
  visible,
  setVisible,
  day,
  refetchDays,
}: {
  selectedMeal: MealData | null
  unselect: () => void
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  day: Day
  refetchDays: () => void
}) {
  const { debug } = useUserContext()
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    if (!selectedMeal) {
      throw new Error('No meal selected!')
    }

    // TODO: Create a proper onNewFoodItem function
    const oldMeal = { ...selectedMeal }

    const newMeal: MealData = {
      ...oldMeal,
      groups: [...oldMeal.groups, newGroup] satisfies MealData['groups'],
    }

    const oldMeals = [...day.meals]

    const newMeals: MealData[] = [...oldMeals]
    const changePos = newMeals.findIndex((m) => m.id === oldMeal.id)

    if (changePos === -1) {
      throw new Error('Meal not found! Searching for id: ' + oldMeal.id)
    }

    newMeals[changePos] = newMeal

    const newDay: Day = {
      ...day,
      meals: newMeals,
    }

    updateDay(day.id, newDay)
    refetchDays()
  }

  if (!selectedMeal) {
    return (
      debug && (
        <h1>ERRO ExternalFoodSearchModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        if (!visible) {
          unselect()
        }
        setVisible(visible)
      }}
    >
      <FoodSearchModal
        targetName={selectedMeal.name}
        onFinish={() => {
          unselect()
          setVisible(false)
          refetchDays()
        }}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function ExternalItemGroupEditModal({
  editModalId,
  selectedItemGroup,
  visible,
  setVisible,
  unselect,
  selectedMeal,
  dayData,
  refetchDays,
}: {
  editModalId: string
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  selectedItemGroup: ItemGroup | null
  selectedMeal: MealData | null
  unselect: () => void
  dayData: Day
  refetchDays: () => void
}) {
  const { debug } = useUserContext()

  if (selectedMeal === null) {
    return (
      debug && (
        <h1>ERRO ExternalItemGroupEditModal: Nenhuma refeição selecionada!</h1>
      )
    )
  }

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        if (!visible) {
          unselect()
        }
        setVisible(visible)
      }}
    >
      <ItemGroupEditModal
        modalId={editModalId}
        group={selectedItemGroup}
        targetMealName={selectedMeal?.name ?? 'ERROR: No meal selected'}
        onSaveGroup={async (group) => {
          console.debug('ItemGroupEditModal onApply, received group', group)
          await updateDay(dayData.id, {
            ...dayData,
            meals: dayData.meals.map((meal) => {
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
          setVisible(false)
        }}
        onDelete={async (id: ItemGroup['id']) => {
          const oldMeals = [...dayData.meals]

          const newMeals: MealData[] = oldMeals.map((meal) => {
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

          const newDay = { ...dayData }

          newDay.meals = newMeals

          await updateDay(dayData.id, newDay)

          refetchDays() // TODO: Vai dar uma merda
          unselect() // TODO: Vai dar uma merda
          setVisible(false)
        }}
        onRefetch={refetchDays}
      />
    </ModalContextProvider>
  )
}
