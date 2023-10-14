'use client'

import { useUserId } from '@/context/users.context'
import { Loadable } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { Measure, createMeasure } from '@/model/measureModel'
import { fetchUserMeasures, insertMeasure } from '@/controllers/measures'
import { MeasureChart } from '@/sections/profile/components/measure/MeasureChart'
import { MeasureView } from '@/sections/profile/components/measure/MeasureView'
import { useFloatFieldOld } from '@/hooks/field'
import { FloatInput } from '@/sections/common/components/FloatInput'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export function MeasuresEvolution({ onSave }: { onSave: () => void }) {
  const userId = useUserId()

  const [measures, setMeasures] = useState<Loadable<Measure[]>>({
    loading: true,
  })
  const heightField = useFloatFieldOld()
  const waistField = useFloatFieldOld()
  const hipField = useFloatFieldOld()
  const neckField = useFloatFieldOld()

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
          <div className="flex mb-3">
            <span className="w-1/4 text-center my-auto text-lg">Altura</span>
            <FloatInput
              field={heightField}
              className="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => event.target.select()}
            />
          </div>
          <div className="flex mb-3">
            <span className="w-1/4 text-center my-auto text-lg">Cintura</span>
            <FloatInput
              field={waistField}
              className="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => event.target.select()}
            />
          </div>
          <div className="flex mb-3">
            <span className="w-1/4 text-center my-auto text-lg">Quadril</span>
            <FloatInput
              field={hipField}
              className="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => event.target.select()}
            />
          </div>
          <div className="flex mb-3">
            <span className="w-1/4 text-center my-auto text-lg">Pescoço</span>
            <FloatInput
              field={neckField}
              className="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => event.target.select()}
            />
          </div>

          <button
            className="btn btn-primary no-animation w-full"
            onClick={async () => {
              if (
                !heightField.value ||
                !waistField.value ||
                !hipField.value ||
                !neckField.value
              ) {
                alert('Medidas inválidas') // TODO: Change all alerts with ConfirmModal
                return
              }

              await insertMeasure(
                createMeasure({
                  owner: userId,
                  height: heightField.value.value ?? 0,
                  waist: waistField.value.value ?? 0,
                  hip: hipField.value.value ?? 0,
                  neck: neckField.value.value ?? 0,
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
