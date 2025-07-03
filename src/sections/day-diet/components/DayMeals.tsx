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
import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import DayNotFound from '~/sections/day-diet/components/DayNotFound'
import { DeleteDayButton } from '~/sections/day-diet/components/DeleteDayButton'
import {
  MealEditView,
  MealEditViewActions,
  MealEditViewContent,
  MealEditViewHeader,
} from '~/sections/meal/components/MealEditView'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import {
  closeModal,
  openContentModal,
  openEditModal,
} from '~/shared/modal/helpers/modalHelpers'
import { createDebug } from '~/shared/utils/createDebug'
import { stringToDate } from '~/shared/utils/date'

const debug = createDebug()

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
  const handleEditUnifiedItem = (meal: Meal, item: UnifiedItem) => {
    const dayDiet = resolvedDayDiet()
    if (!dayDiet) {
      console.error('Cannot edit item: no day diet available')
      return
    }

    const dayDate = stringToDate(dayDiet.target_day)
    const macroTarget = getMacroTargetForDay(dayDate)

    const editModalId = openEditModal(
      () => (
        <UnifiedItemEditModal
          targetMealName={meal.name}
          item={() => item}
          macroOverflow={() => {
            let macroOverflow
            if (!macroTarget) {
              macroOverflow = {
                enable: false,
                originalItem: undefined,
              }
            } else {
              macroOverflow = {
                enable: true,
                originalItem: item,
              }
            }

            debug('macroOverflow:', macroOverflow)
            return macroOverflow
          }}
          onApply={(updatedItem) => {
            void updateUnifiedItem(meal.id, updatedItem.id, updatedItem)
            closeModal(editModalId)
          }}
          onCancel={() => {
            closeModal(editModalId)
          }}
          onClose={() => {
            closeModal(editModalId)
          }}
          showAddItemButton={true}
        />
      ),
      {
        title: 'Editar item',
        targetName: meal.name,
      },
    )
  }

  const handleUpdateMeal = async (_day: DayDiet, meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      // TODO: Reenable lock logic with proper confirmation dialog
      // setShowConfirmEdit(true)
      return
    }
    await updateMeal(meal.id, meal)
  }

  const handleNewItemButton = (meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      // TODO: Reenable lock logic with proper confirmation dialog
      // setShowConfirmEdit(true)
      return
    }
    const searchModalId = openContentModal(
      () => (
        <TemplateSearchModal
          targetName={meal.name}
          onNewUnifiedItem={(newItem) => {
            const neverNullDayDiet = resolvedDayDiet()
            if (neverNullDayDiet) {
              handleNewUnifiedItem(meal, newItem)
            }
          }}
          onFinish={() => {
            handleFinishSearch()
            closeModal(searchModalId)
          }}
          onClose={() => {
            handleFinishSearch()
            closeModal(searchModalId)
          }}
        />
      ),
      {
        title: `Adicionar item à secão "${meal.name}"`,
      },
    )
  }

  const handleNewUnifiedItem = (meal: Meal, newItem: UnifiedItem) => {
    void insertUnifiedItem(meal.id, newItem)
  }

  const handleFinishSearch = () => {}

  // Use the provided dayDiet prop if present, otherwise fallback to currentDayDiet
  const resolvedDayDiet = () => props.dayDiet ?? currentDayDiet()

  return (
    <>
      <Show
        when={resolvedDayDiet()}
        fallback={<DayNotFound selectedDay={props.selectedDay} />}
        keyed
      >
        {(neverNullDayDiet) => (
          <>
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
