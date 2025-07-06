import { createEffect, createSignal, Show, Suspense } from 'solid-js'

import {
  acceptDayChange,
  currentDayDiet,
  currentToday,
  dayChangeData,
  dismissDayChangeModal,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { Alert } from '~/sections/common/components/Alert'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { DayChangeModal } from '~/sections/day-diet/components/DayChangeModal'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'
import DayNotFound from '~/sections/day-diet/components/DayNotFound'
import TopBar from '~/sections/day-diet/components/TopBar'
import { openContentModal } from '~/shared/modal/helpers/modalHelpers'

export default function DietPage() {
  const [mode, setMode] = createSignal<'edit' | 'read-only' | 'summary'>('edit')

  function handleRequestEditMode() {
    setMode('edit')
  }

  createEffect(() => {
    setMode(targetDay() === currentToday() ? 'edit' : 'read-only')
  })

  // Show day change modal when day changes
  createEffect(() => {
    const changeData = dayChangeData()
    if (changeData) {
      openContentModal(
        (modalId) => (
          <DayChangeModal
            modalId={modalId}
            newDay={currentToday}
            onGoToToday={acceptDayChange}
            onStayOnDay={dismissDayChangeModal}
          />
        ),
        {
          closeOnOutsideClick: false,
          closeOnEscape: true,
          showCloseButton: false,
        },
      )
    }
  })

  return (
    <Suspense fallback={<PageLoading message="Carregando dieta do dia..." />}>
      <TopBar selectedDay={targetDay()} />
      <Show when={currentDayDiet()} fallback={<div />}>
        {(currentDayDiet) => (
          <DayMacros dayDiet={currentDayDiet()} class="mb-4" />
        )}
      </Show>
      {mode() !== 'edit' && (
        <Alert class="mt-2" color="yellow">
          Mostrando refeições do dia {targetDay()}!
        </Alert>
      )}
      <Show
        when={currentDayDiet()}
        fallback={<DayNotFound selectedDay={targetDay()} />}
      >
        {(currentDayDiet) => (
          <Suspense fallback={<LoadingRing />}>
            <DayMeals
              dayDiet={currentDayDiet()}
              selectedDay={targetDay()}
              mode={mode()}
              onRequestEditMode={handleRequestEditMode}
            />
          </Suspense>
        )}
      </Show>
    </Suspense>
  )
}
