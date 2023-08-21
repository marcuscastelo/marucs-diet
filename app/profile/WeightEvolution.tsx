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
  const [weightField, setWeightField] = useState<string>(
    weight.weight.toString(),
  )

  const handleSave = async () => {
    const floatWeightField = parseFloat(weightField)
    setWeightField(floatWeightField.toFixed(2))
    await updateWeight(weight.id, {
      ...weight,
      weight: parseFloat(floatWeightField.toFixed(2)),
    })
    onSave()
  }

  return (
    <Capsule
      leftContent={
        <p className={`ml-2 p-2 text-md text-center`}>
          {weight.target_timestamp.toLocaleDateString()}{' '}
          {weight.target_timestamp.toLocaleTimeString()}
        </p>
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
                await handleSave()
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
  const movingAverage = (weights: Weight[], windowSize: number) => {
    const movingAverageWeights: Weight[] = []

    for (let i = 0; i < weights.length; i++) {
      const windowStart = Math.max(0, i - windowSize)
      const windowEnd = i + 1

      const windowWeights = weights.slice(windowStart, windowEnd)

      const windowSum = windowWeights.reduce(
        (sum, weight) => sum + weight.weight,
        0,
      )

      const windowAverage = windowSum / windowWeights.length

      movingAverageWeights.push({
        ...weights[i],
        weight: windowAverage,
      })
    }

    return movingAverageWeights
  }

  const weightsWithMovingAverage = movingAverage(weights, 7)

  const data = weights.map((weight, index) => {
    return {
      name: weight.target_timestamp.toLocaleDateString(),
      weight: weight.weight,
      movingAverage: weightsWithMovingAverage[index].weight,
    }
  })

  return (
    <ResponsiveContainer width="90%" height={400}>
      <ComposedChart width={0} height={400} data={data}>
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis type="category" dataKey="name" angle={30} />
        <YAxis
          type="number"
          domain={[
            Math.min(...data.map((weight) => weight.weight)) - 1,
            Math.max(...data.map((weight) => weight.weight)) + 1,
          ]}
          allowDecimals={false}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="weight"
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
      </ComposedChart>
    </ResponsiveContainer>
  )
}
