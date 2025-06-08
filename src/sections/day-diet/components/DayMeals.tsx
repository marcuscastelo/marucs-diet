import {
  type Accessor,
  For,
  type Setter,
  Show,
  createEffect,
  createSignal,
  untrack,
} from 'solid-js'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  deleteItemGroup,
  insertItemGroup,
  updateItemGroup,
} from '~/modules/diet/item-group/application/itemGroup'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { updateMeal } from '~/modules/diet/meal/application/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { showError } from '~/modules/toast/application/toastManager'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import DayNotFound from '~/sections/day-diet/components/DayNotFound'
import { DeleteDayButton } from '~/sections/day-diet/components/DeleteDayButton'
import { ItemGroupEditModal } from '~/sections/item-group/components/ItemGroupEditModal'
import {
  MealEditView,
  MealEditViewActions,
  MealEditViewContent,
  MealEditViewHeader,
} from '~/sections/meal/components/MealEditView'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { formatError } from '~/shared/formatError'
import { Modal } from '~/sections/common/components/Modal'

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

/**
 * Displays and manages the meals for a given day.
 * If dayDiet is provided, uses it; otherwise, uses the currentDayDiet from application state.
 * @param props.dayDiet Optional DayDiet to display (overrides selectedDay)
 * @param props.selectedDay The day string (YYYY-MM-DD) to display
 * @param props.mode Display mode: 'edit', 'read-only' or 'summary'.
 */
export default function DayMeals(props: {
  dayDiet?: DayDiet
  selectedDay: string
  mode?: 'edit' | 'read-only' | 'summary'
  onRequestEditMode?: () => void
}) {
  const [itemGroupEditModalVisible, setItemGroupEditModalVisible] =
    createSignal(false)

  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const [showConfirmEdit, setShowConfirmEdit] = createSignal(false)

  const handleRequestViewItemGroup = (meal: Meal, itemGroup: ItemGroup) => {
    // Always open the modal for any mode, but ItemGroupEditModal will respect the mode prop
    setEditSelection({ meal, itemGroup })
    setItemGroupEditModalVisible(true)
  }

  const handleUpdateMeal = async (day: DayDiet, meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      setShowConfirmEdit(true)
      return
    }
    await updateMeal(day.id, meal.id, meal)
  }

  const handleNewItemButton = (meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      setShowConfirmEdit(true)
      return
    }
    setNewItemSelection({ meal })
    setTemplateSearchModalVisible(true)
  }

  const handleNewItemGroup = (dayDiet: DayDiet, newGroup: ItemGroup) => {
    const newItemSelection_ = newItemSelection()
    if (newItemSelection_ === null) {
      throw new Error('No meal selected!')
    }
    void insertItemGroup(dayDiet.id, newItemSelection_.meal.id, newGroup)
  }

  const handleFinishSearch = () => {
    setNewItemSelection(null)
  }

  // Use the provided dayDiet prop if present, otherwise fallback to currentDayDiet
  const resolvedDayDiet = () => props.dayDiet ?? currentDayDiet()

  return (
    <>
      <ModalContextProvider
        visible={showConfirmEdit}
        setVisible={setShowConfirmEdit}
      >
        <Modal>
          <div class="p-4">
            <div class="font-bold mb-2">
              Deseja desbloquear este dia para edição?
            </div>
            <div class="flex gap-2 justify-end mt-4">
              <button
                class="btn cursor-pointer uppercase btn-primary"
                onClick={() => {
                  setShowConfirmEdit(false)
                  props.onRequestEditMode?.()
                }}
              >
                Desbloquear dia para edição
              </button>
              <button
                class="btn cursor-pointer uppercase btn-ghost"
                onClick={() => setShowConfirmEdit(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      </ModalContextProvider>
      <Show
        when={resolvedDayDiet()}
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
              targetName={
                newItemSelection()?.meal.name ?? 'Nenhuma refeição selecionada'
              }
              onNewItemGroup={(newGroup) => {
                handleNewItemGroup(neverNullDayDiet, newGroup)
              }}
              onFinish={handleFinishSearch}
            />
            <ExternalItemGroupEditModal
              day={() => neverNullDayDiet}
              visible={itemGroupEditModalVisible}
              setVisible={setItemGroupEditModalVisible}
              mode={props.mode}
            />
            <For each={neverNullDayDiet.meals}>
              {(meal) => (
                <MealEditView
                  class="mt-5"
                  meal={meal}
                  header={
                    <MealEditViewHeader
                      onUpdateMeal={(meal) => {
                        if (props.mode === 'summary') return
                        const current = resolvedDayDiet()
                        if (current === null) {
                          console.error('resolvedDayDiet is null!')
                          throw new Error('resolvedDayDiet is null!')
                        }
                        handleUpdateMeal(current, meal).catch((e) => {
                          console.error(e)
                          showError(
                            `Erro ao atualizar refeição: ${formatError(e)}`,
                          )
                        })
                      }}
                      mode={props.mode}
                    />
                  }
                  content={
                    <MealEditViewContent
                      onRequestViewItemGroup={(item) => {
                        handleRequestViewItemGroup(meal, item)
                      }}
                      mode={props.mode}
                    />
                  }
                  actions={
                    props.mode === 'summary' ? undefined : (
                      <MealEditViewActions
                        onNewItem={() => {
                          handleNewItemButton(meal)
                        }}
                      />
                    )
                  }
                />
              )}
            </For>

            {props.mode !== 'summary' && (
              <>
                <CopyLastDayButton
                  dayDiet={() => neverNullDayDiet}
                  selectedDay={props.selectedDay}
                />
                <DeleteDayButton day={() => neverNullDayDiet} />
              </>
            )}
          </>
        )}
      </Show>
    </>
  )
}

function ExternalItemGroupEditModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  day: Accessor<DayDiet>
  mode?: 'edit' | 'read-only' | 'summary'
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
            targetMealName={editSelection().meal.name}
            onSaveGroup={(group) => {
              void updateItemGroup(
                props.day().id,
                editSelection().meal.id,
                group.id, // TODO:   Get id from selection instead of group parameter (avoid bugs if id is changed).
                group,
              )

              // TODO:   Analyze if these commands are troublesome
              setEditSelection(null)
              props.setVisible(false)
            }}
            onDelete={(id: ItemGroup['id']) => {
              void deleteItemGroup(props.day().id, editSelection().meal.id, id)

              setEditSelection(null)
              props.setVisible(false)
            }}
            onRefetch={() => {
              console.warn(
                '[DayMeals] (<ItemGroupEditModal/>) onRefetch called!',
              )
            }}
            mode={props.mode}
          />
        </ModalContextProvider>
      )}
    </Show>
  )
}
