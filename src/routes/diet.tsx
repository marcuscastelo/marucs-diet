import { createEffect, createSignal, Show, Suspense } from 'solid-js'

import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { Alert } from '~/sections/common/components/Alert'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { PageLoading } from '~/sections/common/components/PageLoading'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'
import TopBar from '~/sections/day-diet/components/TopBar'
import { getTodayYYYYMMDD } from '~/shared/utils/date'

export default function DietPage() {
  const today = getTodayYYYYMMDD()
  const [mode, setMode] = createSignal<'edit' | 'read-only' | 'summary'>('edit')

  function handleRequestEditMode() {
    setMode('edit')
  }

  createEffect(() => {
    setMode(targetDay() === today ? 'edit' : 'read-only')
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
      <Show when={currentDayDiet()}>
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
