'use client'

import { useUserId } from '@/context/users.context'
import { Loadable } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { Measure, createMeasure } from '@/model/measureModel'
import { fetchUserMeasures, insertMeasure } from '@/controllers/measures'
import { MeasureChart } from './MeasureChart'
import { MeasureView } from './MeasureView'
import { useFloatField } from '@/hooks/field'
import { FloatInput } from '@/components/FloatInput'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function MeasuresEvolution({ onSave }: { onSave: () => void }) {
  const userId = useUserId()

  const [measures, setMeasures] = useState<Loadable<Measure[]>>({
    loading: true,
  })
  const heightField123 = useFloatField()
  const waistField123 = useFloatField()
  const hipField123 = useFloatField()
  const neckField123 = useFloatField()

  const handleRefetchMeasures = useCallback(() => {
    fetchUserMeasures(userId).then((measures) =>
      setMeasures({ loading: false, errored: false, data: measures }),
    )
  }, [userId])

  useEffect(() => {
    handleRefetchMeasures()
  }, [handleRefetchMeasures])

  if (measures.loading || measures.errored) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
          Progresso das medidas
        </h5>
        <div className="mx-5 lg:mx-20 pb-10">
          <FloatInput
            field={heightField123}
            className="input px-0 pl-5 text-xl mb-3"
            style={{ width: '100%' }}
            onFocus={(event) => event.target.select()}
          />
          <FloatInput
            field={waistField123}
            className="input px-0 pl-5 text-xl mb-3"
            style={{ width: '100%' }}
            onFocus={(event) => event.target.select()}
          />
          <FloatInput
            field={hipField123}
            className="input px-0 pl-5 text-xl mb-3"
            style={{ width: '100%' }}
            onFocus={(event) => event.target.select()}
          />
          <FloatInput
            field={neckField123}
            className="input px-0 pl-5 text-xl mb-3"
            style={{ width: '100%' }}
            onFocus={(event) => event.target.select()}
          />
          <button
            className="btn btn-primary no-animation w-full"
            onClick={async () => {
              if (
                !heightField123.value ||
                !waistField123.value ||
                !hipField123.value ||
                !neckField123.value
              ) {
                alert('Medidas inválidas')
                return
              }

              await insertMeasure(
                createMeasure({
                  owner: userId,
                  height: heightField123.value,
                  waist: waistField123.value,
                  hip: hipField123.value,
                  neck: neckField123.value,
                  target_timestamp: new Date(Date.now()),
                }),
              )
              handleRefetchMeasures()
              onSave()
            }}
          >
            Adicionar peso
          </button>
        </div>
        <MeasureChart measures={measures.data} />
        <div className="mx-5 lg:mx-20 pb-10">
          {measures.data &&
            [...measures.data]
              .reverse()
              .slice(0, 10)
              .map((measure) => {
                return (
                  <MeasureView
                    key={measure.id}
                    measure={measure}
                    onRefetchMeasures={handleRefetchMeasures}
                    onSave={onSave}
                  />
                )
              })}
          {measures.data.length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}
