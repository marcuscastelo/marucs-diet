'use client'

import {
  useUserDesiredWeight,
  useUserId,
} from '@/sections/user/context/UserContext'

import { Weight, createWeight } from '@/modules/weight/domain/weight'
import Capsule from '@/sections/common/components/capsule/Capsule'
import TrashIcon from '@/sections/common/components/icons/TrashIcon'
import { Line } from 'recharts'
import { CandleStickChart } from '@/sections/common/components/chart/CandleStickChart'
import { OHLC } from '@/legacy/model/ohlcModel'
import Datepicker from 'react-tailwindcss-datepicker'
import {
  useDateField,
  useFloatField,
  useFloatFieldOld,
} from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { dateToYYYYMMDD } from '@/legacy/utils/dateUtils'
import { CapsuleContent } from '@/sections/common/components/capsule/CapsuleContent'
import {
  calculateWeightProgress,
  firstWeight,
  latestWeight,
} from '@/legacy/utils/weightUtils'
import { computed } from '@preact/signals-react'
import { useWeightContext } from '@/src/sections/weight/context/WeightContext'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export function WeightEvolution({ onSave }: { onSave: () => void }) {
  const userId = useUserId()
  const desiredWeight = useUserDesiredWeight()

  const { weights, insertWeight } = useWeightContext()

  const weightField = useFloatFieldOld()

  if (weights.loading || weights.errored) {
    return <h1>Carregando...</h1>
  }

  const weightProgress = calculateWeightProgress(weights.data, desiredWeight)

  const weightProgressText =
    weightProgress === null ? 'Erro' : `${(weightProgress * 100).toFixed(2)}%`

  return (
    <>
      <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
          Progresso do peso ({weightProgressText})
        </h5>
        <div className="mx-5 lg:mx-20 pb-10">
          <FloatInput
            field={weightField}
            className="input px-0 pl-5 text-xl mb-3"
            onFocus={(event) => event.target.select()}
            style={{ width: '100%' }}
          />
          <button
            className="btn btn-primary no-animation w-full"
            onClick={async () => {
              const weight = weightField.value.value

              if (weight === undefined) {
                alert('Peso inválido (undefined)') // TODO: Change all alerts with ConfirmModal
                return
              }

              insertWeight(
                createWeight({
                  owner: userId,
                  weight,
                  target_timestamp: new Date(Date.now()),
                }),
              )
              onSave()
              weightField.rawValue.value = ''
            }}
          >
            Adicionar peso
          </button>
        </div>
        {/* // TODO: Create combo box to select weight chart variant (7 days or all time)  */}
        <WeightChart
          weights={weights.data}
          desiredWeight={desiredWeight}
          type="all-time"
        />
        <div className="mx-5 lg:mx-20 pb-10">
          {weights.data &&
            [...weights.data]
              .reverse()
              .slice(0, 10)
              .map((weight) => {
                return (
                  <WeightView key={weight.id} weight={weight} onSave={onSave} />
                )
              })}
          {weights.data.length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}

function WeightView({
  weight,
  onSave,
}: {
  weight: Weight
  onSave: () => void
}) {
  const { updateWeight, deleteWeight } = useWeightContext()

  const targetTimestampSignal = computed(() => weight.target_timestamp)
  const dateField = useDateField(targetTimestampSignal)

  const weightSignal = computed(() => weight.weight)
  const weightField = useFloatField(weightSignal)

  const handleSave = ({
    dateValue,
    weightValue,
  }: {
    dateValue: Date | undefined
    weightValue: number | undefined
  }) => {
    if (weightValue === undefined) {
      alert('Peso inválido (undefined)') // TODO: Change all alerts with ConfirmModal
      console.error('Weight is undefined')
      return
    }

    if (dateValue === undefined) {
      alert('Data inválida (undefined)') // TODO: Change all alerts with ConfirmModal
      console.error('Date is undefined')
      return
    }

    updateWeight(weight.id, {
      ...weight,
      weight: weightValue,
      target_timestamp: dateValue,
    })
    onSave()
  }

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateField.rawValue.value,
              endDate: dateField.rawValue.value,
            }}
            onChange={async (value) => {
              if (!value?.startDate) {
                alert('Data inválida') // TODO: Change all alerts with ConfirmModal
                return
              }
              // Apply timezone offset
              const date = new Date(value.startDate)
              dateField.rawValue.value = dateToYYYYMMDD(date)
              handleSave({
                dateValue: date,
                weightValue: weightField.value.value,
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
        <div className={`ml-2 p-2 text-xl flex justify-between`}>
          <div className="flex justify-between sm:gap-10 px-2">
            <FloatInput
              field={weightField}
              className="input text-center btn-ghost px-0 flex-shrink"
              style={{ width: '100%' }}
              onFocus={(event) => event.target.select()}
              onFieldCommit={async (value) => {
                handleSave({
                  dateValue: dateField.value.value,
                  weightValue: value,
                })
              }}
            />
            <span className="my-auto flex-1 hidden sm:block">kg</span>
          </div>
          <button
            className="btn btn-ghost my-auto"
            onClick={async () => {
              deleteWeight(weight.id)
              onSave()
            }}
          >
            <TrashIcon />
          </button>
        </div>
      }
      className={`mb-2`}
    />
  )
}

function WeightChart({
  weights,
  desiredWeight,
  type,
}: {
  weights: readonly Weight[]
  desiredWeight: number
  type: 'last-7-days' | 'all-time'
}) {
  type TickWeight = OHLC & {
    movingAverage?: number
    desiredWeight?: number
  }

  const weightsByDay = weights.reduce(
    (acc, weight) => {
      const week = (() => {
        const date = new Date(weight.target_timestamp)
        const month = date.toLocaleString('default', { month: 'short' })
        const weekNumber = Math.min(4, Math.ceil(date.getDate() / 7))
        return `${month} (${weekNumber}/4)`
      })()
      const day_ = weight.target_timestamp.toLocaleDateString()

      const day = type === 'last-7-days' ? day_ : week
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(weight)
      return acc
    },
    {} as { [day: string]: Weight[] },
  )

  const data: readonly TickWeight[] = Object.entries(weightsByDay)
    .map(([day, weights]) => {
      const open = firstWeight(weights)?.weight ?? 0
      const low = Math.min(...weights.map((weight) => weight.weight))
      const high = Math.max(...weights.map((weight) => weight.weight))
      const close = latestWeight(weights)?.weight ?? 0

      return {
        date: day,
        open,
        close,
        high,
        low,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const movingAverage = data.map((_, index) => {
    const weights = data.slice(Math.max(0, index - 7), index + 1) // 7 days
    const avgWeight =
      weights.reduce((acc, weight) => acc + weight.low, 0) / weights.length
    return avgWeight
  })

  data.forEach((_, index) => {
    data[index].movingAverage = movingAverage[index]
    data[index].desiredWeight = desiredWeight
  })

  return (
    <>
      <CandleStickChart data={data}>
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="orange"
          fill="orange"
          dot={false}
          strokeWidth={3}
          strokeDasharray={'5 5'}
          opacity={1}
        />
        <Line
          type="monotone"
          dataKey="desiredWeight"
          stroke="magenta"
          fill="magenta"
          dot={false}
          strokeWidth={3}
          opacity={1}
        />
      </CandleStickChart>
    </>
  )
}
