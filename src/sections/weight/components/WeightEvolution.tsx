import { createEffect, createSignal, For } from 'solid-js'

import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import { insertWeight, userWeights } from '~/modules/weight/application/weight'
import { createNewWeight } from '~/modules/weight/domain/weight'
import { ComboBox } from '~/sections/common/components/ComboBox'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { useFloatField } from '~/sections/common/hooks/useField'
import { WeightChart } from '~/sections/weight/components/WeightChart'
import { WeightProgress } from '~/sections/weight/components/WeightProgress'
import { WeightView } from '~/sections/weight/components/WeightView'
import { calculateWeightProgress } from '~/shared/utils/weightUtils'

/**
 * Renders the weight evolution view, including progress, chart, and entry form.
 * @returns SolidJS component
 */
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
    calculateWeightProgress(
      userWeights(),
      desiredWeight(),
      currentUser()?.diet ?? 'cut',
    )
  const weightProgressText = () => {
    const progress = weightProgress()
    if (progress === null) return 'N/A'

    switch (progress.type) {
      case 'no_weights':
        return 'Nenhum peso registrado'
      case 'progress':
        if (progress.progress >= 100) {
          return `100% 🎉`
        } else {
          return `${progress.progress.toFixed(1)}%`
        }
      case 'exceeded':
        return `100% + ${progress.exceeded.toFixed(1)}kg 🎉`
      case 'no_change':
        return 'Sem mudança'
      case 'reversal': {
        const signal = progress.currentChange.direction === 'gain' ? '+' : '-'
        return `Diverge ${signal}${progress.reversal.toFixed(1)}kg`
      }
      case 'normo':
        if (progress.difference === 0) {
          return 'Peso ideal atingido 🎉'
        } else {
          const signal = progress.direction === 'gain' ? '+' : '-'
          return `Variação: ${signal}${progress.difference.toFixed(1)}kg`
        }
      default:
        progress satisfies never // Ensure all cases are handled
    }
  }

  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <div class="px-5 lg:px-5 pb-10">
          <div class="flex justify-between items-center px-4">
            <span class="text-2xl font-bold">Gráfico de evolução do peso</span>
            <ComboBox
              options={chartOptions}
              value={chartType()}
              onChange={setChartType}
              class="w-48"
            />
          </div>
          <WeightProgress
            weightProgress={weightProgress()}
            weightProgressText={weightProgressText}
          />
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
