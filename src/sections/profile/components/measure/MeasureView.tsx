'use client'

import { useCallback, useState } from 'react'
import Capsule from '@/src/sections/common/components/capsule/Capsule'
import TrashIcon from '@/src/sections/common/components/icons/TrashIcon'
import Datepicker from 'react-tailwindcss-datepicker'
import { Measure } from '@/model/measureModel'
import { deleteMeasure, updateMeasure } from '@/controllers/measures'
import { CapsuleContent } from '@/src/sections/common/components/capsule/CapsuleContent'
import { useFloatFieldOld } from '@/hooks/field'
import { FloatInput } from '@/sections/common/components/FloatInput'

export function MeasureView({
  measure,
  onRefetchMeasures,
  onSave,
}: {
  measure: Measure
  onRefetchMeasures: () => void
  onSave: () => void
}) {
  const [dateField, setDateField] = useState<Date>(measure.target_timestamp)

  const heightField = useFloatFieldOld(measure.height)
  const waistField = useFloatFieldOld(measure.waist)
  const hipField = useFloatFieldOld(measure.hip)
  const neckField = useFloatFieldOld(measure.neck)

  const handleSave = useCallback(
    ({
      date,
      height,
      waist,
      hip,
      neck,
    }: {
      date: Date
      height: number | undefined
      waist: number | undefined
      hip: number | undefined
      neck: number | undefined
    }) => {
      if (!height || !waist || !hip || !neck) {
        alert('Medidas inválidas') // TODO: Change all alerts with ConfirmModal
        return
      }

      updateMeasure(measure.id, {
        ...measure,
        height,
        waist,
        hip,
        neck,
        target_timestamp: date,
      }).then(() => {
        onSave()
        onRefetchMeasures()
      })
    },
    [measure, onSave, onRefetchMeasures],
  )

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateField,
              endDate: dateField,
            }}
            onChange={async (value) => {
              if (!value?.startDate) {
                alert('Data inválida') // TODO: Change all alerts with ConfirmModal
                return
              }
              // Apply timezone offset
              const date = new Date(value.startDate)
              date.setHours(date.getHours() + 3)
              setDateField(date)

              handleSave({
                date,
                height: heightField.value.value,
                waist: waistField.value.value,
                hip: hipField.value.value,
                neck: neckField.value.value,
              })
            }}
            // Timezone = GMT-3
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            containerClassName="relative w-full text-gray-700"
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
          />
        </CapsuleContent>
      }
      rightContent={
        <CapsuleContent>
          <div className="flex justify-between sm:gap-10 px-2">
            <div className="flex flex-col">
              <div className="flex">
                <span className="my-auto">Altura:</span>
                <FloatInput
                  field={heightField}
                  className="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => event.target.select()}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField,
                      height: value,
                      waist: waistField.value.value,
                      hip: hipField.value.value,
                      neck: neckField.value.value,
                    })
                  }}
                />
                <span className="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div className="flex">
                <span className="my-auto">Cintura:</span>
                <FloatInput
                  field={waistField}
                  className="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => event.target.select()}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField,
                      height: heightField.value.value,
                      waist: value,
                      hip: hipField.value.value,
                      neck: neckField.value.value,
                    })
                  }}
                />
                <span className="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div className="flex">
                <span className="my-auto">Quadril:</span>
                <FloatInput
                  field={hipField}
                  className="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => event.target.select()}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField,
                      height: heightField.value.value,
                      waist: waistField.value.value,
                      hip: value,
                      neck: neckField.value.value,
                    })
                  }}
                />
                <span className="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div className="flex">
                <span className="my-auto">Pescoço:</span>
                <FloatInput
                  field={neckField}
                  className="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => event.target.select()}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField,
                      height: heightField.value.value,
                      waist: waistField.value.value,
                      hip: hipField.value.value,
                      neck: value,
                    })
                  }}
                />
                <span className="my-auto flex-1 hidden sm:block">cm</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost my-auto"
            onClick={async () => {
              await deleteMeasure(measure.id)
              onRefetchMeasures()
              onSave()
            }}
          >
            <TrashIcon />
          </button>
        </CapsuleContent>
      }
      className={`mb-2`}
    />
  )
}
