import { For, createEffect, createMemo } from 'solid-js'
import { type Weight, createNewWeight } from '~/modules/weight/domain/weight'
import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { type OHLC } from '~/legacy/model/ohlcModel'
import { useDateField, useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import {
  calculateWeightProgress,
  firstWeight,
  getLatestWeight,
} from '~/legacy/utils/weightUtils'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import {
  deleteWeight,
  insertWeight,
  updateWeight,
  userWeights,
} from '~/modules/weight/application/weight'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { adjustToTimezone, dateToYYYYMMDD } from '~/legacy/utils/dateUtils'
import { SolidApexCharts } from 'solid-apexcharts'
import { type ApexOptions } from 'apexcharts'
import toast from 'solid-toast'
import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { formatError } from '~/shared/formatError'

export function WeightEvolution() {
  const desiredWeight = () => currentUser()?.desired_weight ?? 0

  const weightField = useFloatField(undefined, {
    maxValue: 200,
  })

  const weightProgress = () =>
    calculateWeightProgress(userWeights(), desiredWeight())

  const weightProgressText = () =>
    weightProgress === null
      ? 'Erro'
      : `${((weightProgress() ?? 0) * 100).toFixed(2)}%`

  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 class={'mx-auto mb-5 text-center text-3xl font-bold'}>
          Progresso do peso ({weightProgressText()})
        </h5>
        <div class="mx-5 lg:mx-20 pb-10">
          {/* // TODO: Create combo box to select weight chart variant (7 days or all time)  */}
          <WeightChart
            weights={userWeights()}
            desiredWeight={desiredWeight()}
            type="all-time"
          />
          <FloatInput
            field={weightField}
            class="input px-0 pl-5 text-xl mb-3"
            onFocus={(event) => {
              event.target.select()
            }}
            style={{ width: '100%' }}
          />
          <button
            class="btn btn-primary no-animation w-full"
            onClick={() => {
              const weight = weightField.value()

              if (weight === undefined) {
                toast.error('Digite um peso')
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
                .catch((error) => {
                  console.error(error)
                  toast.error(
                    `Erro ao adicionar peso: ${formatError(error)}`,
                  )
                })
            }}
          >
            Adicionar peso
          </button>
        </div>

        <div class="mx-5 lg:mx-20 pb-10">
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
      toast.error('Digite um peso')
      console.error('Weight is undefined')
      return
    }

    if (dateValue === undefined) {
      toast.error('Digite uma data')
      console.error('Date is undefined')
      return
    }

    updateWeight(props.weight.id, {
      ...props.weight,
      weight: weightValue,
      target_timestamp: dateValue,
    }).catch((error) => {
      console.error(error)
      toast.error('Erro ao atualizar')
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
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (!value?.startDate) {
                toast.error('Data inválida: \n' + JSON.stringify(value))
                return
              }
              // Apply timezone offset
              const date = adjustToTimezone(new Date(value.startDate))
              dateField.setRawValue(dateToYYYYMMDD(date))
              handleSave({
                dateValue: date,
                weightValue: weightField.value(),
              })
            }}
            // Timezone = GMT-3
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            toggleIcon={() => <></>}
            containerClassName="relative w-full text-gray-700 "
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
          />
        </CapsuleContent>
      }
      rightContent={
        <div class={'ml-2 p-2 text-xl flex justify-between'}>
          <div class="flex justify-between sm:gap-10 px-2">
            <FloatInput
              field={weightField}
              class="input text-center btn-ghost px-0 flex-shrink"
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
            <span class="my-auto flex-1 hidden sm:block">kg</span>
          </div>
          <button
            class="btn btn-ghost my-auto"
            onClick={() => {
              deleteWeight(props.weight.id).catch((error) => {
                console.error(error)
                toast.error(
                  `Erro ao deletar peso: ${formatError(error)}`,
                )
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
  type: 'last-30-days' | 'all-time'
}) {
  type TickWeight = OHLC & {
    movingAverage?: number
    desiredWeight?: number
  }

  const reduceFunc = (acc: Record<string, Weight[]>, weight: Weight) => {
    const half = (() => {
      // 1 to 4 weeks of a month
      const date = new Date(weight.target_timestamp)
      const month = date.toLocaleString('default', { month: 'short' })
      const year = date.getFullYear()
      const twoDigitYear = year % 100
      // const weekNumber = Math.min(4, Math.ceil(date.getDate() / 7))

      // 1 to 2 half of a month (1 -> 1-15, 2 -> 16-31)
      const halfNumber = Math.min(2, Math.ceil(date.getDate() / 15))

      return `${month} ${twoDigitYear} (${halfNumber}/2)`
    })()
    const day = weight.target_timestamp.getDate()
    const month = weight.target_timestamp.getMonth() + 1
    const year = weight.target_timestamp.getFullYear()
    const twoDigitYear = year % 100

    // TODO: create weight chart types: Daily, Weekly, Monthly, Semianually, Anually, Auto

    const date_ = `${day}/${month}/${twoDigitYear}`
    const date = props.type === 'last-30-days' ? date_ : half
    if (acc[date] === undefined) {
      acc[date] = []
    }
    acc[date].push(weight)

    return acc
  }

  const weightsByDay = createMemo(() =>
    props.weights.reduce<Record<string, Weight[]>>(reduceFunc, {}),
  )

  const data = createMemo(
    (): readonly TickWeight[] =>
      Object.entries(weightsByDay()).map(([day, weights]) => {
        const open = firstWeight(weights)?.weight ?? 0
        const low = Math.min(...weights.map((weight) => weight.weight))
        const high = Math.max(...weights.map((weight) => weight.weight))
        const close = getLatestWeight(weights)?.weight ?? 0

        return {
          date: day,
          open,
          close,
          high,
          low,
        }
      }),
    // .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  )

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

  const options = () =>
    ({
      theme: {
        mode: 'dark',
      },
      xaxis: {
        type: 'category',
        range: props.type === 'last-30-days' ? 30 : undefined,
      },
      yaxis: {
        decimalsInFloat: 0,
        min: min() - 1,
        max: max() + 1,
        tickAmount: Math.min((max() - min()) / 2, 20),
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
            // we need to clear the range as we only need it on the initial load.
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
    }) satisfies ApexOptions

  const series = createMemo(() => ({
    list: [
      {
        name: 'Pesos',
        type: 'candlestick',
        data: polishedData().map((weight) => ({
          x: weight.date,
          y: [weight.open, weight.high, weight.low, weight.close],
        })),
      },
      {
        name: 'Média',
        type: 'line',
        color: '#FFA50055',
        data: polishedData().map((weight) => ({
          x: weight.date,
          y: [weight.movingAverage],
        })),
      },
      {
        name: 'Peso desejado',
        type: 'line',
        color: '#FF00FF',
        data: polishedData().map((weight) => ({
          x: weight.date,
          y: [weight.desiredWeight],
        })),
      },
    ] satisfies ApexOptions['series'],
  }))

  createEffect(() => {
    console.log('polishedData', polishedData())
  })

  return (
    <>
      <SolidApexCharts
        type="candlestick"
        options={options()}
        series={series().list}
        height={600}
      />
    </>
  )
}
