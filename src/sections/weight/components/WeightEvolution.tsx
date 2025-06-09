/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type ApexOptions } from 'apexcharts'
import { SolidApexCharts } from 'solid-apexcharts'
import { createMemo, createSignal, For } from 'solid-js'

import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import {
  calculateWeightProgress,
  firstWeight,
  getLatestWeight,
} from '~/legacy/utils/weightUtils'
import { type OHLC } from '~/modules/measure/domain/ohlc'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import {
  deleteWeight,
  insertWeight,
  updateWeight,
  userWeights,
} from '~/modules/weight/application/weight'
import { createNewWeight, type Weight } from '~/modules/weight/domain/weight'
import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import { ComboBox } from '~/sections/common/components/ComboBox'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { useDateField, useFloatField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { adjustToTimezone, dateToYYYYMMDD } from '~/shared/utils/date'

export function WeightEvolution() {
  const desiredWeight = () => currentUser()?.desired_weight ?? 0

  const [chartType, setChartType] = createSignal<
    '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
  >('all')

  const chartOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '14d', label: 'Últimos 14 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Todo o período' },
  ]

  const weightField = useFloatField(undefined, {
    maxValue: 200,
  })

  const weightProgress = () =>
    calculateWeightProgress(userWeights(), desiredWeight())

  const weightProgressText = () =>
    weightProgress() === null
      ? 'Erro'
      : `${((weightProgress() ?? 0) * 100).toFixed(2)}%`

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
            onFocus={(event) => {
              event.target.select()
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
            {(weight) => {
              return <WeightView weight={weight} />
            }}
          </For>
          {userWeights().length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}

function WeightView(props: { weight: Weight }) {
  const targetTimestampSignal = () => props.weight.target_timestamp
  const dateField = useDateField(targetTimestampSignal)

  const weightSignal = () => props.weight.weight
  const weightField = useFloatField(weightSignal)

  const handleSave = ({
    dateValue,
    weightValue,
  }: {
    dateValue: Date | undefined
    weightValue: number | undefined
  }) => {
    if (weightValue === undefined) {
      showError('Digite um peso')
      return
    }

    if (dateValue === undefined) {
      showError('Digite uma data')
      return
    }

    void updateWeight(props.weight.id, {
      ...props.weight,
      weight: weightValue,
      target_timestamp: dateValue,
    })
  }

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateField.rawValue(),
              endDate: dateField.rawValue(),
            }}
            onChange={(value) => {
              if (value === null || value.startDate === null) {
                showError('Data inválida: \n' + JSON.stringify(value))
                return
              }
              const date = adjustToTimezone(new Date(value.startDate as string))
              dateField.setRawValue(dateToYYYYMMDD(date))
              handleSave({
                dateValue: date,
                weightValue: weightField.value(),
              })
            }}
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            toggleIcon={() => <></>}
            containerClassName="relative w-full text-gray-700"
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
          />
        </CapsuleContent>
      }
      rightContent={
        <div class="ml-0 p-2 text-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center w-full gap-2 sm:gap-1">
          <div class="relative w-full flex items-center">
            <FloatInput
              field={weightField}
              class="input bg-transparent text-end btn-ghost px-0 shrink pr-9 text-xl font-inherit w-full"
              style={{ width: '100%' }}
              onFocus={(event) => {
                event.target.select()
              }}
              onFieldCommit={(value) => {
                handleSave({
                  dateValue: dateField.value(),
                  weightValue: value,
                })
              }}
            />
            <span class="absolute right-2 pointer-events-none select-none text-xl font-inherit text-inherit">
              kg
            </span>
          </div>
          <button
            class="btn cursor-pointer uppercase btn-ghost my-auto focus:ring-2 focus:ring-blue-400 border-none text-white bg-ghost hover:bg-slate-800 py-2 px-2 w-full sm:w-auto"
            onClick={() => {
              void deleteWeight(props.weight.id)
            }}
          >
            <TrashIcon />
          </button>
        </div>
      }
      class={'mb-2'}
    />
  )
}

function WeightChart(props: {
  weights: readonly Weight[]
  desiredWeight: number
  type: '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
}) {
  type TickWeight = OHLC & {
    movingAverage?: number
    desiredWeight?: number
  }

  function getCandlePeriod(type: string): { days: number; count: number } {
    switch (type) {
      case '7d':
        return { days: 1, count: 7 }
      case '14d':
        return { days: 1, count: 14 }
      case '30d':
        return { days: 1, count: 30 }
      case '6m':
        return { days: 15, count: 12 }
      case '1y':
        return { days: 30, count: 12 }
      case 'all':
        return { days: 0, count: 12 }
      default:
        return { days: 1, count: 7 }
    }
  }

  function groupWeights(
    weights: readonly Weight[],
    type: string,
  ): Record<string, Weight[]> {
    if (type === 'all') {
      if (!weights.length) return {}
      const sorted = [...weights].sort(
        (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
      )
      const firstObj = sorted[0]
      const lastObj = sorted[sorted.length - 1]
      if (!firstObj || !lastObj) return {}
      const first = firstObj.target_timestamp.getTime()
      const last = lastObj.target_timestamp.getTime()
      const totalDays = Math.max(
        1,
        Math.round((last - first) / (1000 * 60 * 60 * 24)),
      )
      const daysPerCandle = Math.max(1, Math.round(totalDays / 12))
      const result: Record<string, Weight[]> = {}
      for (let i = 0; i < 12; i++) {
        const start = new Date(first + i * daysPerCandle * 24 * 60 * 60 * 1000)
        const end = new Date(
          first + (i + 1) * daysPerCandle * 24 * 60 * 60 * 1000,
        )
        const key = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        result[key] = sorted.filter(
          (w) => w.target_timestamp >= start && w.target_timestamp < end,
        )
      }
      return result
    }
    const { days, count } = getCandlePeriod(type)
    if (!weights.length) return {}
    const sorted = [...weights].sort(
      (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
    )
    const lastObj = sorted[sorted.length - 1]
    if (!lastObj) return {}
    const last = lastObj.target_timestamp
    const result: Record<string, Weight[]> = {}
    for (let i = count - 1; i >= 0; i--) {
      let start: Date, end: Date
      if (days === 1) {
        start = new Date(last)
        start.setDate(start.getDate() - i)
        end = new Date(start)
        end.setDate(end.getDate() + 1)
      } else {
        start = new Date(last)
        start.setDate(start.getDate() - i * days)
        end = new Date(start)
        end.setDate(end.getDate() + days)
      }
      const key = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
      result[key] = sorted.filter(
        (w) => w.target_timestamp >= start && w.target_timestamp < end,
      )
    }
    return result
  }

  const weightsByPeriod = createMemo(() =>
    groupWeights(props.weights, props.type),
  )

  const data = createMemo((): readonly TickWeight[] => {
    const entries = Object.entries(weightsByPeriod()) as [string, Weight[]][]
    const filled: TickWeight[] = []
    let lastValue: number | undefined = undefined
    let i = 0
    while (i < entries.length) {
      const entry = entries[i]
      if (!entry) break
      const [period, weights] = entry
      if (weights.length > 0) {
        const open = firstWeight(weights)?.weight ?? 0
        const low = Math.min(...weights.map((weight: Weight) => weight.weight))
        const high = Math.max(...weights.map((weight: Weight) => weight.weight))
        const close = getLatestWeight(weights)?.weight ?? 0
        lastValue = close
        filled.push({
          date: period,
          open,
          close,
          high,
          low,
        })
        i++
      } else {
        // Interpolation
        // Find next non-empty value
        let nextIdx = i + 1
        while (nextIdx < entries.length) {
          const nextEntry = entries[nextIdx]
          let nextArr: Weight[] | undefined = undefined
          if (nextEntry && Array.isArray(nextEntry[1])) {
            nextArr = nextEntry[1]
          }
          if (!nextArr || nextArr.length > 0) break
          nextIdx++
        }
        const nextEntry = entries[nextIdx]
        const nextWeights = nextEntry ? nextEntry[1] : undefined
        let nextValue: number | undefined = lastValue
        if (nextWeights && nextWeights.length > 0) {
          nextValue = firstWeight(nextWeights)?.weight
        }
        const steps = nextIdx - i + 1
        for (let j = 0; j < nextIdx - i; j++) {
          // Linear interpolation between lastValue and nextValue
          let interp = lastValue
          if (lastValue !== undefined && nextValue !== undefined && steps > 1) {
            interp = lastValue + ((nextValue - lastValue) * (j + 1)) / steps
          }
          const fakeEntry = entries[i + j]
          filled.push({
            date: fakeEntry ? fakeEntry[0] : '',
            open: interp ?? 0,
            close: interp ?? 0,
            high: interp ?? 0,
            low: interp ?? 0,
            // @ts-expect-error: custom property for UI
            isInterpolated: true,
          })
        }
        i = nextIdx
      }
    }
    return filled
  })

  const movingAverage = createMemo(() =>
    data().map((_, index) => {
      const weights = data().slice(Math.max(0, index - 7), index + 1) // 7 days
      const avgWeight =
        weights.reduce((acc, weight) => acc + weight.low, 0) / weights.length
      return avgWeight
    }),
  )

  const polishedData = createMemo(() =>
    data().map((weight, index) => {
      return {
        ...weight,
        movingAverage: movingAverage()[index],
        desiredWeight: props.desiredWeight,
      }
    }),
  )

  const max = createMemo(() =>
    polishedData().reduce(
      (acc, weight) =>
        Math.max(acc, Math.max(weight.desiredWeight, weight.high)),
      -Infinity,
    ),
  )
  const min = createMemo(() =>
    polishedData().reduce(
      (acc, weight) =>
        Math.min(acc, Math.min(weight.desiredWeight, weight.low)),
      Infinity,
    ),
  )

  // Custom yAxis config logic
  const yAxisConfig = createMemo(() => {
    const minValue = min()
    const maxValue = max()
    const diff = maxValue - minValue
    if (diff < 2) {
      return { tickAmount: 10, decimalsInFloat: 2, tickInterval: 0.1 }
    }
    if (diff < 5) {
      return { tickAmount: 8, decimalsInFloat: 1, tickInterval: 0.25 }
    }
    if (diff < 10) {
      return { tickAmount: 6, decimalsInFloat: 1, tickInterval: 0.5 }
    }
    if (diff < 20) {
      return {
        tickAmount: Math.ceil(diff),
        decimalsInFloat: 1,
        tickInterval: 1,
      }
    }
    if (diff < 40) {
      return {
        tickAmount: Math.ceil(diff / 2),
        decimalsInFloat: 0,
        tickInterval: 2,
      }
    }
    if (diff < 60) {
      return {
        tickAmount: Math.ceil(diff / 4),
        decimalsInFloat: 0,
        tickInterval: 4,
      }
    }
    return {
      tickAmount: undefined,
      decimalsInFloat: 0,
      tickInterval: undefined,
    }
  })

  const options = () => {
    const yAxis = yAxisConfig()
    const yAxisExtra =
      typeof yAxis.tickInterval === 'number' &&
      !isNaN(yAxis.tickInterval) &&
      yAxis.tickInterval > 0
        ? {
            forceNiceScale: false,
            stepSize: yAxis.tickInterval,
          }
        : {}
    return {
      theme: {
        mode: 'dark',
      },
      xaxis: {
        type: 'category',
      },
      yaxis: {
        decimalsInFloat: yAxis.decimalsInFloat,
        min: min() - 1,
        max: max() + 1,
        tickAmount: yAxis.tickAmount,
        labels: {
          formatter: (val: number) => val.toFixed(yAxis.decimalsInFloat),
        },
        ...yAxisExtra,
      },
      stroke: {
        width: 3,
        curve: 'straight',
      },
      dataLabels: {
        enabled: false,
      },
      chart: {
        id: 'solidchart-example',
        locales: [ptBrLocale],
        defaultLocale: 'pt-br',
        background: '#1E293B',
        events: {
          beforeZoom: function (ctx) {
            ctx.w.config.xaxis.range = undefined
          },
        },
        zoom: {
          autoScaleYaxis: true,
        },
        animations: {
          enabled: true,
        },
        toolbar: {
          tools: {
            download: false,
            selection: false,
            zoom: true,
            zoomin: false,
            zoomout: false,
            pan: true,
            reset: true,
          },
          autoSelected: 'pan',
        },
      },
    } satisfies ApexOptions
  }
  const series = createMemo(() => [
    {
      type: 'candlestick',
      name: 'Pesos',
      data: polishedData().map((weight) => {
        const isInterpolated =
          (weight as { isInterpolated?: boolean }).isInterpolated === true
        return {
          x: weight.date,
          y: [weight.open, weight.high, weight.low, weight.close],
          fillColor: isInterpolated ? '#888888' : undefined,
          strokeColor: isInterpolated ? '#888888' : undefined,
        }
      }),
    },
    {
      type: 'line',
      name: 'Média',
      color: '#FFA50055',
      data: polishedData().map((weight) => ({
        x: weight.date,
        y: weight.movingAverage,
      })),
    },
    {
      type: 'line',
      name: 'Peso desejado',
      color: '#FF00FF',
      data: polishedData().map((weight) => ({
        x: weight.date,
        y: weight.desiredWeight,
      })),
    },
  ])
  return (
    <SolidApexCharts
      type="candlestick"
      options={options()}
      series={series()}
      height={600}
    />
  )
}
