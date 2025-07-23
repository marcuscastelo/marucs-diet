import { For } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { updateMeal } from '~/modules/diet/meal/application/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  addItemToMeal,
  updateItemInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { CopyLastDayButton } from '~/sections/day-diet/components/CopyLastDayButton'
import { DeleteDayButton } from '~/sections/day-diet/components/DeleteDayButton'
import {
  MealEditView,
  MealEditViewActions,
  MealEditViewContent,
  MealEditViewHeader,
} from '~/sections/meal/components/MealEditView'
import { openConfirmModal } from '~/shared/modal/helpers/modalHelpers'
import {
  openTemplateSearchModal,
  openUnifiedItemEditModal,
} from '~/shared/modal/helpers/specializedModalHelpers'
import { createDebug } from '~/shared/utils/createDebug'
import { stringToDate } from '~/shared/utils/date/dateUtils'

const debug = createDebug()

/**
 * Displays and manages the meals for a given day.
 * If dayDiet is provided, uses it; otherwise, uses the currentDayDiet from application state.
 * @param props.dayDiet Optional DayDiet to display (overrides selectedDay)
 * @param props.selectedDay The day string (YYYY-MM-DD) to display
 * @param props.mode Display mode: 'edit', 'read-only' or 'summary'.
 */
export default function DayMeals(props: {
  dayDiet: DayDiet
  selectedDay: string
  mode: 'edit' | 'read-only' | 'summary'
  onRequestEditMode?: () => void
}) {
  const handleEditUnifiedItem = (meal: Meal, item: UnifiedItem) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      openConfirmModal('O dia não pode ser editado', {
        title: 'Dia não editável',
        confirmText: 'Desbloquear',
        cancelText: 'Cancelar',
        onConfirm: () => {
          props.onRequestEditMode?.()
        },
      })

      return
    }

    const dayDate = stringToDate(props.dayDiet.target_day)
    const macroTarget = getMacroTargetForDay(dayDate)

    openUnifiedItemEditModal({
      targetMealName: meal.name,
      item: () => item,
      macroOverflow: () => {
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
      },
      onApply: (updatedItem) => {
        const updatedMeal = updateItemInMeal(meal, updatedItem.id, updatedItem)
        void handleUpdateMeal(updatedMeal)
      },
      targetName: meal.name,
      showAddItemButton: true,
    })
  }

  const handleUpdateMeal = async (meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      openConfirmModal('O dia não pode ser editado', {
        title: 'Dia não editável',
        confirmText: 'Desbloquear',
        cancelText: 'Cancelar',
        onConfirm: () => {
          props.onRequestEditMode?.()
        },
      })

      return
    }
    await updateMeal(meal.id, meal)
  }

  const handleNewItemButton = (meal: Meal) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      openConfirmModal('O dia não pode ser editado', {
        title: 'Dia não editável',
        confirmText: 'Desbloquear',
        cancelText: 'Cancelar',
        onConfirm: () => {
          props.onRequestEditMode?.()
        },
      })
      return
    }

    openTemplateSearchModal({
      targetName: meal.name,
      onNewUnifiedItem: (newItem) => handleNewUnifiedItem(meal, newItem),
    })
  }

  const handleNewUnifiedItem = (meal: Meal, newItem: UnifiedItem) => {
    if (props.mode === 'summary') return
    if (props.mode !== 'edit') {
      openConfirmModal('O dia não pode ser editado', {
        title: 'Dia não editável',
        confirmText: 'Desbloquear',
        cancelText: 'Cancelar',
        onConfirm: () => {
          props.onRequestEditMode?.()
        },
      })

      return
    }

    const updatedMeal = addItemToMeal(meal, newItem)
    void handleUpdateMeal(updatedMeal)
  }

  return (
    <>
      <For each={props.dayDiet.meals}>
        {(meal) => (
          <MealEditView
            class="mt-5"
            dayDiet={() => props.dayDiet}
            meal={() => meal}
            header={
              <MealEditViewHeader
                onUpdateMeal={(meal) => {
                  handleUpdateMeal(meal).catch((e) => {
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
                onUpdateMeal={(meal) => void handleUpdateMeal(meal)}
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
            dayDiet={() => props.dayDiet}
            selectedDay={props.selectedDay}
          />
          <DeleteDayButton day={() => props.dayDiet} />
        </>
      )}
    </>
  )
}
