import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  type Setter,
  Show,
} from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  insertUnifiedItem,
  updateUnifiedItem,
} from '~/modules/diet/item-group/application/itemGroup'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { updateMeal } from '~/modules/diet/meal/application/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import DayNotFound from '~/sections/day-diet/components/DayNotFound'
import { DeleteDayButton } from '~/sections/day-diet/components/DeleteDayButton'
import {
  MealEditView,
  MealEditViewActions,
  MealEditViewContent,
  MealEditViewHeader,
} from '~/sections/meal/components/MealEditView'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { createDebug } from '~/shared/utils/createDebug'
import { stringToDate } from '~/shared/utils/date'

type EditSelection = {
  meal: Meal
  item: UnifiedItem
} | null

type NewItemSelection = {
  meal: Meal
} | null

const debug = createDebug()

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
  mode: 'edit' | 'read-only' | 'summary'
  onRequestEditMode?: () => void
}) {
  const [unifiedItemEditModalVisible, setUnifiedItemEditModalVisible] =
    createSignal(false)

  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const [showConfirmEdit, setShowConfirmEdit] = createSignal(false)

  const handleEditUnifiedItem = (meal: Meal, item: UnifiedItem) => {
    setEditSelection({ meal, item })
    setUnifiedItemEditModalVisible(true)
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

  const handleNewUnifiedItem = (dayDiet: DayDiet, newItem: UnifiedItem) => {
    const newItemSelection_ = newItemSelection()
    if (newItemSelection_ === null) {
      throw new Error('No meal selected!')
    }
    void insertUnifiedItem(dayDiet.id, newItemSelection_.meal.id, newItem)
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
              onNewUnifiedItem={(newItem) => {
                handleNewUnifiedItem(neverNullDayDiet, newItem)
              }}
              onFinish={handleFinishSearch}
            />
            <ExternalUnifiedItemEditModal
              day={() => neverNullDayDiet}
              visible={unifiedItemEditModalVisible}
              setVisible={setUnifiedItemEditModalVisible}
              mode={props.mode}
            />
            <For each={neverNullDayDiet.meals}>
              {(meal) => (
                <MealEditView
                  class="mt-5"
                  dayDiet={() => neverNullDayDiet}
                  meal={() => meal}
                  header={
                    <MealEditViewHeader
                      dayDiet={neverNullDayDiet}
                      onUpdateMeal={(meal) => {
                        if (props.mode === 'summary') return
                        const current = resolvedDayDiet()
                        if (current === null) {
                          console.error('resolvedDayDiet is null!')
                          throw new Error('resolvedDayDiet is null!')
                        }
                        handleUpdateMeal(current, meal).catch((e) => {
                          showError(e, {}, 'Erro ao atualizar refeição')
                        })
                      }}
                      mode={props.mode}
                    />
                  }
                  content={
                    <MealEditViewContent
                      onEditItem={(item) => {
                        handleEditUnifiedItem(meal, item)
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

function ExternalUnifiedItemEditModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  day: Accessor<DayDiet>
  mode: 'edit' | 'read-only' | 'summary'
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
          <UnifiedItemEditModal
            targetMealName={editSelection().meal.name}
            item={() => editSelection().item}
            macroOverflow={() => {
              const day = props.day()
              const dayDate = stringToDate(day.target_day)
              const macroTarget = getMacroTargetForDay(dayDate)

              let macroOverflow
              if (!macroTarget) {
                macroOverflow = {
                  enable: false,
                  originalItem: undefined,
                }
              } else {
                macroOverflow = {
                  enable: true,
                  originalItem: editSelection().item,
                }
              }

              debug('macroOverflow:', macroOverflow)
              return macroOverflow
            }}
            onApply={(item) => {
              void updateUnifiedItem(
                props.day().id,
                editSelection().meal.id,
                item.id, // TODO: Get id from selection instead of item parameter (avoid bugs if id is changed).
                item,
              )

              // TODO: Analyze if these commands are troublesome
              setEditSelection(null)
              props.setVisible(false)
            }}
            onCancel={() => {
              setEditSelection(null)
              props.setVisible(false)
            }}
            showAddItemButton={true}
          />
        </ModalContextProvider>
      )}
    </Show>
  )
}
