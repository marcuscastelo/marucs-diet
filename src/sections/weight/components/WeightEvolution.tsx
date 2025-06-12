/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type ApexOptions } from 'apexcharts'
import { SolidApexCharts } from 'solid-apexcharts'
import { createEffect, createMemo, createSignal, For } from 'solid-js'

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
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useDateField, useFloatField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { adjustToTimezone, dateToYYYYMMDD } from '~/shared/utils/date'

// Utils
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
  if (!weights.length) return {}
  const sorted = [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )
  if (type === 'all') {
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

function buildChartData(
  weightsByPeriod: Record<string, Weight[]>,
): Array<OHLC & { date: string; isInterpolated?: boolean }> {
  const entries = Object.entries(weightsByPeriod)
  const filled: Array<OHLC & { date: string; isInterpolated?: boolean }> = []
  let lastValue: number | undefined
  let i = 0
  let firstNonEmptyIdx = entries.findIndex(([, ws]) => ws.length > 0)
  let firstNonEmptyValue: number | undefined =
    firstNonEmptyIdx !== -1 && entries[firstNonEmptyIdx]
      ? firstWeight(entries[firstNonEmptyIdx][1])?.weight
      : undefined
  while (i < entries.length) {
    const entry = entries[i]
    if (!entry) break
    const [period, weights] = entry
    if (weights.length > 0) {
      const open = firstWeight(weights)?.weight ?? 0
      const low = Math.min(...weights.map((w) => w.weight))
      const high = Math.max(...weights.map((w) => w.weight))
      const close = getLatestWeight(weights)?.weight ?? 0
      lastValue = close
      filled.push({ date: period, open, close, high, low })
      i++
    } else {
      let nextIdx = i + 1
      while (
        nextIdx < entries.length &&
        entries[nextIdx] !== undefined &&
        Array.isArray(entries[nextIdx]?.[1]) &&
        (entries[nextIdx]?.[1] as Weight[] | undefined)?.length === 0
      )
        nextIdx++
      const nextEntry = entries[nextIdx]
      const nextWeights = nextEntry ? nextEntry[1] : undefined
      let nextValue: number | undefined = lastValue
      if (nextWeights && nextWeights.length > 0)
        nextValue = firstWeight(nextWeights)?.weight
      const steps = nextIdx - i + 1
      for (let j = 0; j < nextIdx - i; j++) {
        let interp = lastValue
        if (lastValue === undefined && firstNonEmptyValue !== undefined)
          interp = firstNonEmptyValue
        else if (
          lastValue !== undefined &&
          nextValue !== undefined &&
          steps > 1
        )
          interp = lastValue + ((nextValue - lastValue) * (j + 1)) / steps
        const fakeEntry = entries[i + j]
        filled.push({
          date: fakeEntry ? fakeEntry[0] : '',
          open: interp ?? 0,
          close: interp ?? 0,
          high: interp ?? 0,
          low: interp ?? 0,
          isInterpolated: true,
        })
      }
      i = nextIdx
    }
  }
  return filled
}

function getYAxisConfig(min: number, max: number) {
  const diff = max - min + 2
  if (diff <= 2)
    return {
      tickAmount: Math.round(diff * 10),
      decimalsInFloat: 2,
      tickInterval: 0.1,
    }
  if (diff < 4)
    return {
      tickAmount: Math.round(diff * 4),
      decimalsInFloat: 2,
      tickInterval: 0.25,
    }
  if (diff < 10)
    return {
      tickAmount: Math.round(diff * 2),
      decimalsInFloat: 1,
      tickInterval: 0.5,
    }
  if (diff < 20)
    return { tickAmount: Math.ceil(diff), decimalsInFloat: 0, tickInterval: 1 }
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
  return { tickAmount: undefined, decimalsInFloat: 0, tickInterval: undefined }
}

export function calculateMovingAverage(
  data: readonly { low: number }[],
  window: number = 7,
): number[] {
  return data.map((_, index) => {
    const weights = data.slice(Math.max(0, index - window), index + 1)
    return weights.reduce((acc, weight) => acc + weight.low, 0) / weights.length
  })
}

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

function WeightView(props: { weight: Weight }) {
  const targetTimestampSignal = () => props.weight.target_timestamp
  const dateField = useDateField(targetTimestampSignal)
  const weightSignal = () => props.weight.weight
  const weightField = useFloatField(weightSignal)
  const { show: showConfirmModal } = useConfirmModalContext()
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
              handleSave({ dateValue: date, weightValue: weightField.value() })
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
              onFocus={(e) => e.target.select()}
              onFieldCommit={(value) =>
                handleSave({ dateValue: dateField.value(), weightValue: value })
              }
            />
            <span class="absolute right-2 pointer-events-none select-none text-xl font-inherit text-inherit">
              kg
            </span>
          </div>
          <button
            class="btn cursor-pointer uppercase btn-ghost my-auto focus:ring-2 focus:ring-blue-400 border-none text-white bg-ghost hover:bg-slate-800 py-2 px-2 w-full sm:w-auto"
            onClick={() => {
              showConfirmModal({
                title: 'Confirmar exclusão',
                body: 'Tem certeza que deseja excluir este peso? Esta ação não pode ser desfeita.',
                actions: [
                  {
                    text: 'Cancelar',
                    onClick: () => {},
                  },
                  {
                    text: 'Excluir',
                    primary: true,
                    onClick: () => {
                      void deleteWeight(props.weight.id)
                    },
                  },
                ],
                hasBackdrop: true,
              })
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
  const weightsByPeriod = createMemo(() =>
    groupWeights(props.weights, props.type),
  )
  const data = createMemo(() => buildChartData(weightsByPeriod()))
  const movingAverage = createMemo(() => calculateMovingAverage(data(), 7))
  const polishedData = createMemo(() =>
    data().map((weight, index) => ({
      ...weight,
      movingAverage: movingAverage()[index],
      desiredWeight: props.desiredWeight,
    })),
  )
  const max = createMemo(() =>
    Math.max(...polishedData().map((w) => Math.max(w.desiredWeight, w.high))),
  )
  const min = createMemo(() =>
    Math.min(...polishedData().map((w) => Math.min(w.desiredWeight, w.low))),
  )
  const yAxis = createMemo(() => getYAxisConfig(min(), max()))
  const options = () => {
    const y = yAxis()
    return {
      theme: { mode: 'dark' },
      xaxis: { type: 'category' },
      yaxis: {
        decimalsInFloat: y.decimalsInFloat,
        min: min() - 1,
        max: max() + 1,
        tickAmount: y.tickAmount,
        labels: {
          formatter: (val: number) => `${val.toFixed(y.decimalsInFloat)} kg`,
        },
      },
      stroke: { width: 3, curve: 'straight' },
      dataLabels: { enabled: false },
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
        zoom: { autoScaleYaxis: true },
        animations: { enabled: true },
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
      tooltip: {
        shared: true,
        custom({ dataPointIndex, w }: { dataPointIndex: number; w: unknown }) {
          const chartW = w as {
            config?: {
              series?: Array<{
                data?: Array<{ x: string; y: number[] | number }>
              }>
            }
          }
          const point =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[0] &&
            chartW.config.series[0].data
              ? (chartW.config.series[0].data[dataPointIndex] as
                  | { x: string; y: number[] }
                  | undefined)
              : undefined
          const avg =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[1] &&
            chartW.config.series[1].data &&
            typeof chartW.config.series[1].data[dataPointIndex]?.y === 'number'
              ? chartW.config.series[1].data[dataPointIndex].y
              : undefined
          const desired =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[2] &&
            chartW.config.series[2].data &&
            typeof chartW.config.series[2].data[dataPointIndex]?.y === 'number'
              ? chartW.config.series[2].data[dataPointIndex].y
              : undefined
          let range = ''
          if (point && Array.isArray(point.y) && point.y.length >= 3) {
            const low = point.y[2]
            const high = point.y[1]
            if (typeof low === 'number' && typeof high === 'number') {
              range = `${low.toFixed(2)}~${high.toFixed(2)}`
            }
          }
          let progress = ''
          // Calculate progress as distance from first ever weight to target
          let firstWeightValue: number | undefined
          if (Array.isArray(props.weights) && props.weights.length > 0) {
            // Find the earliest weight in the full dataset
            const sorted = [...props.weights].sort(
              (a, b) =>
                a.target_timestamp.getTime() - b.target_timestamp.getTime(),
            )
            firstWeightValue = sorted[0]?.weight
          }
          if (
            typeof desired === 'number' &&
            typeof firstWeightValue === 'number' &&
            point &&
            Array.isArray(point.y) &&
            typeof point.y[3] === 'number' &&
            desired !== firstWeightValue
          ) {
            const close = point.y[3]
            const progress_ =
              (firstWeightValue - close) / (firstWeightValue - desired)
            progress = (progress_ * 100).toFixed(2) + '%'
          }
          return `<div style='padding:8px'>
            <div><b>${point?.x ?? ''}</b></div>
            <div><b>${range}</b></div>
            <div>Média: <b>${avg !== undefined ? avg.toFixed(2) : '-'}</b></div>
            <div>Peso desejado: <b>${desired !== undefined ? desired.toFixed(2) : '-'}</b></div>
            <div>Progresso: <b>${progress}</b></div>
          </div>`
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
