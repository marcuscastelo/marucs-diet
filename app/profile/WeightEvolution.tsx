'use client'

import { useUserId } from '@/context/users.context'
import {
  deleteWeight,
  fetchUserWeights,
  insertWeight,
  updateWeight,
} from '@/controllers/weights'
import { Weight, createWeight } from '@/model/weightModel'
import { Loadable } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import Capsule from '../Capsule'
import TrashIcon from '../(icons)/TrashIcon'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CandleStickChart } from '@/components/chart/CandleStickChart'
import { OHLC } from '@/model/ohlcModel'
import Datepicker from 'react-tailwindcss-datepicker'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function WeightEvolution({ onSave }: { onSave: () => void }) {
  const userId = useUserId()

  const [weights, setWeights] = useState<Loadable<Weight[]>>({ loading: true })
  const [weightField, setWeightField] = useState<string>('')

  const handleRefetchWeights = useCallback(() => {
    fetchUserWeights(userId).then((weights) =>
      setWeights({ loading: false, errored: false, data: weights }),
    )
  }, [userId])

  useEffect(() => {
    handleRefetchWeights()
  }, [handleRefetchWeights])

  if (weights.loading || weights.errored) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
          Progresso do peso
        </h5>
        <div className="mx-5 lg:mx-20 pb-10">
          <input
            className="input px-0 pl-5 text-xl mb-3"
            style={{ width: '100%' }}
            value={weightField}
            onChange={(event) => setWeightField(event.target.value)}
          />
          <button
            className="btn btn-primary no-animation w-full"
            onClick={async () => {
              const weight = parseFloat(weightField)
              if (isNaN(weight)) {
                alert('Peso inválido')
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
            }}
          >
            Adicionar peso
          </button>
        </div>
        <WeightChart weights={weights.data} />
        <div className="mx-5 lg:mx-20 pb-10">
          {weights.data &&
            [...weights.data].reverse().map((weight) => {
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
  const [dateField, setDateField] = useState<Date>(weight.target_timestamp)

  const [weightField, setWeightField] = useState<string>(
    weight.weight.toString(),
  )

  const handleSave = async ({
    dateField,
    weightField,
  }: {
    dateField: Date
    weightField: string
  }) => {
    const floatWeightField = parseFloat(weightField)
    setWeightField(floatWeightField.toFixed(2))
    await updateWeight(weight.id, {
      ...weight,
      weight: parseFloat(floatWeightField.toFixed(2)),
      target_timestamp: dateField,
    })
    onSave()
  }

  return (
    <Capsule
      leftContent={
        <>
          <Datepicker
            value={{
              startDate: dateField,
              endDate: dateField,
            }}
            onChange={async (value) => {
              if (!value?.startDate) {
                alert('Data inválida')
                return
              }
              // Apply timezone offset
              const date = new Date(value.startDate)
              date.setHours(date.getHours() + 3)
              setDateField(date)

              await handleSave({
                dateField: date,
                weightField,
              })
              onRefetchWeights()
            }}
            // Timezone = GMT-3
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            containerClassName={`ml-2 p-2 text-md text-center`}
            inputClassName={`btn-ghost`}
          />
          {/* <p className={`ml-2 p-2 text-md text-center`}>
            {weight.target_timestamp.toLocaleDateString()}{' '}
            {weight.target_timestamp.toLocaleTimeString()}
          </p> */}
        </>
      }
      rightContent={
        <div className={`ml-2 p-2 text-xl flex justify-between`}>
          <div className="flex">
            <input
              className="input text-center btn-ghost px-0 flex-shrink"
              style={{ width: '100%' }}
              value={weightField}
              onChange={(event) => setWeightField(event.target.value)}
              onFocus={(event) => event.target.select()}
              onBlur={async () => {
                await handleSave({
                  dateField,
                  weightField,
                })
                onRefetchWeights()
              }}
            />
            <span className="my-auto flex-1">kg</span>
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

function WeightChart({ weights }: { weights: Weight[] }) {
  type DayWeight = OHLC & {
    movingAverage?: number
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
      const open = weights[0].weight
      const low = Math.min(...weights.map((weight) => weight.weight))
      const high = Math.max(...weights.map((weight) => weight.weight))
      const close = weights[weights.length - 1].weight

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
  })

  return (
    <ResponsiveContainer width="90%" height={400}>
      <CandleStickChart data={data}>
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="orange"
          fill="orange"
          dot={false}
          strokeWidth={3}
          opacity={0.2}
        />
      </CandleStickChart>
      {/* <ComposedChart width={0} height={400} data={data}>
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis type="category" dataKey="day" angle={30} />
        <YAxis
          type="number"
          domain={[minWeight - 1, maxWeight + 1]}
          allowDecimals={false}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avgWeight"
          stroke="#FF8A4C"
          fill="#FF8A4C"
        />
        <Line
          type="monotone"
          dataKey="minWeight"
          stroke="#FF8A4C"
          fill="#FF8A4C"
        />
        <Line
          type="monotone"
          dataKey="maxWeigth"
          stroke="#FF8A4C"
          fill="#FF8A4C"
        />
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="#00FFFF"
          fill="#00FFFF"
          strokeDasharray={'10 10'}
        />
      </ComposedChart> */}
    </ResponsiveContainer>
  )
}
