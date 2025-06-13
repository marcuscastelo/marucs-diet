import { createEffect, createSignal, For } from 'solid-js'

import {
  calculateWeightProgress,
  firstWeight,
  getLatestWeight,
} from '~/legacy/utils/weightUtils'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import { insertWeight, userWeights } from '~/modules/weight/application/weight'
import { createNewWeight } from '~/modules/weight/domain/weight'
import { ComboBox } from '~/sections/common/components/ComboBox'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { useFloatField } from '~/sections/common/hooks/useField'
import { WeightChart } from '~/sections/weight/components/WeightChart'
import { WeightView } from '~/sections/weight/components/WeightView'

export function WeightEvolution() {
  const desiredWeight = () => currentUser()?.desired_weight ?? 0
  const initialChartType = (() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weight-evolution-chart-type')
      if (
        stored === '7d' ||
        stored === '14d' ||
        stored === '30d' ||
        stored === '6m' ||
        stored === '1y' ||
        stored === 'all'
      ) {
        return stored
      }
    }
    return 'all'
  })()
  const [chartType, setChartType] = createSignal<
    '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
  >(initialChartType)
  createEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weight-evolution-chart-type', chartType())
    }
  })
  const chartOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '14d', label: 'Últimos 14 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Todo o período' },
  ]
  const weightField = useFloatField(undefined, { maxValue: 200 })
  const weightProgress = () =>
    calculateWeightProgress(userWeights(), desiredWeight())
  const weightProgressText = () => {
    const progress = weightProgress()
    if (userWeights().length === 0) return '-'
    if (progress === null) return '-'
    const user = currentUser()
    const diet = user?.diet ?? 'cut'
    if (progress < 0) {
      const first = firstWeight(userWeights())
      const latest = getLatestWeight(userWeights())
      if (
        first &&
        latest &&
        ((diet === 'cut' && latest.weight > first.weight) ||
          (diet === 'bulk' && latest.weight < first.weight))
      ) {
        const diff = Math.abs(latest.weight - first.weight)
        return `Regressão: +${diff.toFixed(2)} kg`
      }
      // Se não houve regressão real, mostra progresso normal
      const clamped = Math.max(0, Math.min(progress, 1))
      const isOverAchieved = progress > 1
      if (isOverAchieved) {
        const desired = user?.desired_weight
        if (typeof desired === 'number' && latest) {
          const extra = Math.abs(latest.weight - desired)
          return `${(clamped * 100).toFixed(2)}% 🎉  Extra: ${extra.toFixed(2)} kg`
        }
        return `${(clamped * 100).toFixed(2)}% 🎉`
      }
      return `${(clamped * 100).toFixed(2)}%`
    }
    // Clamp entre 0% e 100%
    const clamped = Math.max(0, Math.min(progress, 1))
    const isOverAchieved = progress > 1
    if (isOverAchieved) {
      const latest = getLatestWeight(userWeights())
      const desired = user?.desired_weight
      if (typeof desired === 'number' && latest) {
        const extra = Math.abs(latest.weight - desired)
        return `${(clamped * 100).toFixed(2)}% 🎉  Extra: ${extra.toFixed(2)} kg`
      }
      return `${(clamped * 100).toFixed(2)}% 🎉`
    }
    return `${(clamped * 100).toFixed(2)}%`
  }
  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 class={'mx-auto mb-5 text-center text-3xl font-bold'}>
          Progresso do peso ({weightProgressText()})
        </h5>
        <div class="mx-5 lg:mx-20 pb-10">
          <div class="mb-4 flex justify-end">
            <ComboBox
              options={chartOptions}
              value={chartType()}
              onChange={setChartType}
              class="w-48"
            />
          </div>
          <WeightChart
            weights={userWeights()}
            desiredWeight={desiredWeight()}
            type={chartType()}
          />
          <FloatInput
            field={weightField}
            class="input bg-transparent text-center px-0 pl-5 text-xl mb-3"
            onFocus={(e) => {
              e.target.select()
            }}
            style={{ width: '100%' }}
          />
          <button
            class="btn cursor-pointer uppercase btn-primary w-full focus:ring-2 focus:ring-blue-400 bg-blue-700 hover:bg-blue-800 border-none text-white"
            onClick={() => {
              const weight = weightField.value()
              if (weight === undefined) {
                showError('Digite um peso')
                return
              }
              const userId = currentUserId()
              const afterInsert = () => {
                weightField.setRawValue('')
              }
              insertWeight(
                createNewWeight({
                  owner: userId,
                  weight,
                  target_timestamp: new Date(Date.now()),
                }),
              )
                .then(afterInsert)
                .catch(() => {})
            }}
          >
            Adicionar peso
          </button>
        </div>
        <div class="mx-5 lg:mx-20 pb-10">
          {/* TODO: Implement scrollbar for big lists instead of slice */}
          <For each={[...userWeights()].reverse().slice(0, 10)}>
            {(weight) => <WeightView weight={weight} />}
          </For>
          {userWeights().length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}
