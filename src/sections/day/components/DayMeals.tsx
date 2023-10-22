'use client'

import MealEditViewList from '@/sections/meal/components/MealEditViewList'
import { Day, createDay } from '@/modules/diet/day/domain/day'
import MealEditView, {
  MealEditViewProps,
} from '@/sections/meal/components/MealEditView'
import { Alert } from 'flowbite-react'
import DayMacros from '@/sections/day/components/DayMacros'
import { Meal } from '@/src/modules/diet/meal/domain/meal'
import { TemplateSearchModal } from '@/sections/search/components/TemplateSearchModal'
import { ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { calcDayMacros } from '@/legacy/utils/macroMath'
import ItemGroupEditModal from '@/sections/item-group/components/ItemGroupEditModal'
import CopyLastDayButton from '@/sections/day/components/CopyLastDayButton'
import DeleteDayButton from '@/sections/day/components/DeleteDayButton'
import { useRouter } from 'next/navigation'
import { getToday } from '@/legacy/utils/dateUtils'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { useUserContext, useUserId } from '@/sections/user/context/UserContext'
import { addItemGroupToMeal } from '@/legacy/utils/dayEditor'
import {
  ReadonlySignal,
  Signal,
  computed,
  signal,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'
import { useDayContext } from '@/src/sections/day/context/DaysContext'
import DayNotFound from '@/src/sections/day/components/DayNotFound'
import { useMealContext } from '@/src/sections/meal/context/MealContext'
import { useItemGroupContext } from '@/src/sections/item-group/context/ItemGroupContext'
import { deleteInnerGroup } from '@/src/legacy/utils/mealUtils'

type EditSelection = {
  meal: Meal
  itemGroup: ItemGroup
} | null

type NewItemSelection = {
  meal: Meal
} | null

const editSelection = signal<EditSelection>(null)

const newItemSelection = signal<NewItemSelection>(null)

export default function DayMeals({ selectedDay }: { selectedDay: string }) {
  const router = useRouter()
  const today = getToday()
  const showingToday = today === selectedDay

  // TODO: Convert all states to signals
  const { days } = useDayContext()
  const { updateMeal } = useMealContext()

  const day = computed(() => {
    if (days.value.loading || days.value.errored) {
      return undefined
    }
    return days.value.data.find((day) => day.target_day === selectedDay)
  })

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

    updateMeal(day.id, meal.id, meal)
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

  const mealEditPropsList = computed(
    () =>
      day.value?.meals.map((meal): MealEditViewProps => {
        return {
          meal,
          header: (
            <MealEditView.Header
              onUpdateMeal={(meal) => {
                if (day.value === undefined) {
                  console.error('Day is undefined!')
                  throw new Error('Day is undefined!')
                }
                handleUpdateMeal(day.value, meal)
              }}
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
        }
      }) ?? [],
  )

  if (days.value.loading || days.value.errored) {
    return <>Loading days...</>
  }

  if (day.value === undefined) {
    console.debug(`[DayMeals] Day ${selectedDay} not found!`)
    return <DayNotFound selectedDay={selectedDay} />
  }

  const neverUndDay = computed(() => {
    if (day.value === undefined) {
      console.error('Day is undefined!')
      throw new Error('Day is undefined!')
    }
    return day.value
  })

  return (
    <>
      <ExternalTemplateSearchModal
        day={neverUndDay}
        visible={templateSearchModalVisible}
      />
      <ExternalItemGroupEditModal
        day={neverUndDay}
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
      <CopyLastDayButton day={day} selectedDay={selectedDay} />
      <DeleteDayButton day={day} />
    </>
  )
}

function ExternalTemplateSearchModal({
  visible,
  day,
}: {
  visible: Signal<boolean>
  day: ReadonlySignal<Day>
}) {
  const { debug } = useUserContext()
  const { insertItemGroup } = useItemGroupContext()
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    if (newItemSelection.value === null) {
      throw new Error('No meal selected!')
    }

    insertItemGroup(day.value.id, newItemSelection.value.meal.id, newGroup)
  }

  useSignalEffect(() => {
    if (!visible.value) {
      newItemSelection.value = null
    }
  })

  const handleFinishSearch = () => {
    newItemSelection.value = null
    visible.value = false
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
}: {
  visible: Signal<boolean>
  day: ReadonlySignal<Day>
}) {
  const { updateItemGroup, deleteItemGroup } = useItemGroupContext()
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
          if (!editSelection.value) {
            throw new Error('No meal selected!')
          }

          updateItemGroup(
            day.value.id,
            editSelection.value.meal.id,
            group.id, // TODO: Get id from selection instead of group parameter (avoid bugs if id is changed)
            group,
          )

          // TODO: Analyze if these commands are troublesome
          editSelection.value = null
          visible.value = false
        }}
        onDelete={async (id: ItemGroup['id']) => {
          if (!editSelection.value) {
            throw new Error('No meal selected!')
          }

          deleteItemGroup(day.value.id, editSelection.value.meal.id, id)

          editSelection.value = null
          visible.value = false
        }}
        onRefetch={() => {
          console.warn(`[DayMeals] (<ItemGroupEditModal/>) onRefetch called!`)
        }}
      />
    </ModalContextProvider>
  )
}
