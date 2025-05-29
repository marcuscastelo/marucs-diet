import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  MealEditView,
  MealEditViewActions,
  MealEditViewContent,
  MealEditViewHeader,
} from '~/sections/meal/components/MealEditView'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { ItemGroupEditModal } from '~/sections/item-group/components/ItemGroupEditModal'
import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import { DeleteDayButton } from '~/sections/day-diet/components/DeleteDayButton'
import { getTodayYYYMMDD } from '~/legacy/utils/dateUtils'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import DayNotFound from '~/sections/day-diet/components/DayNotFound'
import {
  currentDayDiet,
  setTargetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { updateMeal } from '~/modules/diet/meal/application/meal'
import {
  deleteItemGroup,
  insertItemGroup,
  updateItemGroup,
} from '~/modules/diet/item-group/application/itemGroup'
import {
  type Accessor,
  type Setter,
  Show,
  createEffect,
  createSignal,
  untrack,
  For,
} from 'solid-js'
import { Alert } from '~/sections/common/components/Alert'
import toast from 'solid-toast'
import { formatError } from '~/shared/formatError'

type EditSelection = {
  meal: Meal
  itemGroup: ItemGroup
} | null

type NewItemSelection = {
  meal: Meal
} | null

const [editSelection, setEditSelection] = createSignal<EditSelection>(null)

const [newItemSelection, setNewItemSelection] =
  createSignal<NewItemSelection>(null)

export default function DayMeals(props: { selectedDay: string }) {
  const today = getTodayYYYMMDD()
  const showingToday = () => today === props.selectedDay

  const [dayExplicitlyUnlocked, setDayExplicitlyUnlocked] = createSignal(false)
  const dayLocked = () => !showingToday() && !dayExplicitlyUnlocked()

  const [itemGroupEditModalVisible, setItemGroupEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleEditItemGroup = (meal: Meal, itemGroup: ItemGroup) => {
    if (dayLocked()) {
      toast.error('Dia bloqueado, não é possível editar')
      return
    }

    setEditSelection({ meal, itemGroup })
    setItemGroupEditModalVisible(true)
  }

  const handleUpdateMeal = async (day: DayDiet, meal: Meal) => {
    if (dayLocked()) {
      toast.error('Dia bloqueado, não é possível editar')
      return
    }

    await updateMeal(day.id, meal.id, meal)
  }

  const handleNewItemButton = (meal: Meal) => {
    console.log('New item button clicked')
    if (dayLocked()) {
      toast.error('Dia bloqueado, não é possível editar')
      return
    }

    setNewItemSelection({ meal })

    console.debug('Setting selected meal to', meal)
    setTemplateSearchModalVisible(true)
  }

  const handleNewItemGroup = (dayDiet: DayDiet) => (newGroup: ItemGroup) => {
    const newItemSelection_ = newItemSelection()
    if (newItemSelection_ === null) {
      throw new Error('No meal selected!')
    }

    insertItemGroup(dayDiet.id, newItemSelection_.meal.id, newGroup)
  }

  const handleFinishSearch = () => {
    setNewItemSelection(null)
  }

  return (
    <Show
      when={currentDayDiet()}
      fallback={<DayNotFound selectedDay={props.selectedDay} />}
      keyed
    >
      {(neverNullDayDiet) => (
        <>
          <ExternalTemplateSearchModal
            visible={templateSearchModalVisible}
            setVisible={setTemplateSearchModalVisible}
            onRefetch={() => {
              console.warn('[DayMeals] onRefetch called!')
            }}
            targetName={newItemSelection()?.meal.name ?? 'Nenhuma refeição selecionada'}
            onNewItemGroup={handleNewItemGroup(neverNullDayDiet)}
            onFinish={handleFinishSearch}
          />
          <ExternalItemGroupEditModal
            day={() => neverNullDayDiet}
            visible={itemGroupEditModalVisible}
            setVisible={setItemGroupEditModalVisible}
          />
          <DayMacros class="mt-3 border-b-2 border-gray-800 pb-4" />
          <Show when={!showingToday()}>
            {(_) => (
              <>
                <Alert class="mt-2" color="yellow">
                  Mostrando refeições do dia {props.selectedDay}!
                </Alert>
                <Show when={dayLocked()}>
                  {(_) => (
                    <>
                      <Alert class="mt-2 outline" color="blue">
                        Hoje é dia <b>{today}</b>{' '}
                        <a
                          class="font-bold text-blue-500 hover:cursor-pointer "
                          onClick={() => {
                            setTargetDay(today)
                          }}
                        >
                          Mostrar refeições de hoje
                        </a>{' '}
                        ou{' '}
                        <a
                          class="font-bold text-red-600 hover:cursor-pointer "
                          onClick={() => {
                            setDayExplicitlyUnlocked(true)
                          }}
                        >
                          {' '}
                          Desbloquear dia {props.selectedDay}
                        </a>
                      </Alert>
                    </>
                  )}
                </Show>
              </>
            )}
          </Show>
          <For each={neverNullDayDiet.meals}>
            {(meal) => (
              <MealEditView
                class="mt-5"
                meal={meal}
                header={
                  <MealEditViewHeader
                    onUpdateMeal={(meal) => {
                      const currentDayDiet_ = currentDayDiet()
                      if (currentDayDiet_ === null) {
                        console.error('currentDayDiet is null!')
                        throw new Error('currentDayDiet is null!')
                      }
                      handleUpdateMeal(currentDayDiet_, meal).catch((e) => {
                        console.error(e)
                        toast.error(
                          `Erro ao atualizar refeição: ${formatError(e)}`,
                        )
                      })
                    }}
                  />
                }
                content={
                  <MealEditViewContent
                    onEditItemGroup={(item) => {
                      handleEditItemGroup(meal, item)
                    }}
                  />
                }
                actions={
                  <MealEditViewActions
                    onNewItem={() => {
                      handleNewItemButton(meal)
                    }}
                  />
                }
              />
            )}
          </For>

          <CopyLastDayButton
            dayDiet={() => neverNullDayDiet}
            selectedDay={props.selectedDay}
          />
          <DeleteDayButton day={() => neverNullDayDiet} />
        </>
      )}
    </Show>
  )
}

function ExternalItemGroupEditModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  day: Accessor<DayDiet>
}) {
  createEffect(() => {
    if (!props.visible()) {
      setEditSelection(null)
    }
  })

  return (
    <Show when={editSelection()}>
      {(editSelection) => (
        <ModalContextProvider
          visible={props.visible}
          setVisible={props.setVisible}
        >
          <ItemGroupEditModal
            group={() => editSelection().itemGroup}
            setGroup={(group) => {
              if (group === null) {
                console.error('group is null!')
                throw new Error('group is null!')
              }
              setEditSelection({
                ...untrack(editSelection),
                itemGroup: group,
              })
            }}
            targetMealName={
              editSelection().meal.name ?? 'ERROR: No meal selected'
            }
            onSaveGroup={(group) => {
              updateItemGroup(
                props.day().id,
                editSelection().meal.id,
                group.id, // TODO: Get id from selection instead of group parameter (avoid bugs if id is changed)
                group,
              )

              // TODO: Analyze if these commands are troublesome
              setEditSelection(null)
              props.setVisible(false)
            }}
            onDelete={(id: ItemGroup['id']) => {
              deleteItemGroup(props.day().id, editSelection().meal.id, id)

              setEditSelection(null)
              props.setVisible(false)
            }}
            onRefetch={() => {
              console.warn(
                '[DayMeals] (<ItemGroupEditModal/>) onRefetch called!',
              )
            }}
          />
        </ModalContextProvider>
      )}
    </Show>
  )
}
