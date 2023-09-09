'use client'

import { useUserDesiredWeight, useUserId } from '@/context/users.context'
import {
  deleteWeight,
  fetchUserWeights,
  insertWeight,
  updateWeight,
} from '@/controllers/weights'
import { Weight, createWeight } from '@/model/weightModel'
import { Loadable } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import Capsule from '../../../components/capsule/Capsule'
import TrashIcon from '../../(icons)/TrashIcon'
import { Line } from 'recharts'
import { CandleStickChart } from '@/components/chart/CandleStickChart'
import { OHLC } from '@/model/ohlcModel'
import Datepicker from 'react-tailwindcss-datepicker'
import { useWeights } from '@/hooks/weights'
import { useDateField, useField, useFloatField } from '@/hooks/field'
import { FloatInput } from '@/components/FloatInput'
import { dateToDateString } from '@/utils/dateUtils'
import { CapsuleContent } from '@/components/capsule/CapsuleContent'
import {
  calculateWeightProgress,
  firstWeight,
  latestWeight,
} from '@/utils/weightUtils'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export function WeightEvolution({ onSave }: { onSave: () => void }) {
  const userId = useUserId()
  const desiredWeight = useUserDesiredWeight()

  const { weights, refetch: handleRefetchWeights } = useWeights(userId)

  const weightField = useFloatField()

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
              const weight = weightField.value

              if (weight === undefined) {
                alert('Peso inválido (undefined)')
                return
              }

              await insertWeight(
                createWeight({
                  owner: userId,
                  weight,
                  target_timestamp: new Date(Date.now()),
                }),
              )
              handleRefetchWeights()
              onSave()
              weightField.setRawValue('')
            }}
          >
            Adicionar peso
          </button>
        </div>
        <WeightChart weights={weights.data} desiredWeight={desiredWeight} />
        <div className="mx-5 lg:mx-20 pb-10">
          {weights.data &&
            [...weights.data]
              .reverse()
              .slice(0, 10)
              .map((weight) => {
                return (
                  <WeightView
                    key={weight.id}
                    weight={weight}
                    onRefetchWeights={handleRefetchWeights}
                    onSave={onSave}
                  />
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
  onRefetchWeights,
  onSave,
}: {
  weight: Weight
  onRefetchWeights: () => void
  onSave: () => void
}) {
  const dateField = useDateField(weight.target_timestamp)
  const weightField = useFloatField(weight.weight)

  const handleSave = async ({
    dateValue,
    weightValue,
  }: {
    dateValue: Date | undefined
    weightValue: number | undefined
  }) => {
    if (weightValue === undefined) {
      alert('Peso inválido (undefined)')
      console.error('Weight is undefined')
      return
    }

    if (dateValue === undefined) {
      alert('Data inválida (undefined)')
      console.error('Date is undefined')
      return
    }

    await updateWeight(weight.id, {
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
              startDate: dateField.rawValue,
              endDate: dateField.rawValue,
            }}
            onChange={async (value) => {
              if (!value?.startDate) {
                alert('Data inválida')
                return
              }
              // Apply timezone offset
              const date = new Date(value.startDate)
              dateField.setRawValue(dateToDateString(date))
              dateField.finishTyping() // TODO: Trigger finishTyping onBlur of Datepicker or parent div
              await handleSave({
                dateValue: date,
                weightValue: weightField.value,
              })
              onRefetchWeights()
            }}
            // Timezone = GMT-3
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            toggleIcon={() => <></>}
            containerClassName="relative w-full text-gray-700 "
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
            // containerClassName={`text-md text-center flex-shrink outline overflow-hidden`}
            // inputClassName={`btn-ghost flex-shrink`}
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
              onFieldChange={async (value) => {
                await handleSave({
                  dateValue: dateField.value,
                  weightValue: value,
                })
                onRefetchWeights()
              }}
            />
            <span className="my-auto flex-1 hidden sm:block">kg</span>
          </div>
          <button
            className="btn btn-ghost my-auto"
            onClick={async () => {
              await deleteWeight(weight.id)
              onRefetchWeights()
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
}: {
  weights: Weight[]
  desiredWeight: number
}) {
  type DayWeight = OHLC & {
    movingAverage?: number
    desiredWeight?: number
  }

  const weightsByDay = weights.reduce(
    (acc, weight) => {
      const day = weight.target_timestamp.toLocaleDateString()
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(weight)
      return acc
    },
    {} as { [day: string]: Weight[] },
  )

  const data: DayWeight[] = Object.entries(weightsByDay)
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
      {/*  */}
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
      {/* </CandleStickChart */}
      {/* <ComposedChart data={data} className="outline">
        <XAxis dataKey="date" />
        <YAxis type="number" allowDecimals={false} />
        <CartesianGrid opacity={0.1} />
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="orange"
          fill="orange"
          dot={false}
          strokeWidth={3}
          opacity={0.2}
        />
      </ComposedChart> */}
      {/* </ResponsiveContainer> */}
    </>
  )
}
