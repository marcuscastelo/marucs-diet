import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { createNewMeasure, type Measure } from '~/modules/measure/domain/measure'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import { useFloatField, useDateField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import {
  deleteMeasure,
  updateMeasure,
} from '~/modules/measure/application/measure'
import toast from 'solid-toast'
import { formatError } from '~/shared/formatError'
import { adjustToTimezone } from '~/shared/utils/date/dateUtils'

/**
 * Renders a capsule view for editing and saving a single Measure.
 *
 * @param props.measure - The measure to display and edit
 * @param props.onRefetchMeasures - Callback to refetch measures after update/delete
 */
export function MeasureView(props: {
  measure: Measure
  onRefetchMeasures: () => void
}) {
  const dateField = useDateField(() => props.measure.target_timestamp, { fallback: () => new Date() })

  const heightField = useFloatField(() => props.measure.height)
  const waistField = useFloatField(() => props.measure.waist)
  const hipField = useFloatField(() => props.measure.hip)
  const neckField = useFloatField(() => props.measure.neck)

  const handleSave = ({
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
    if (
      height === undefined ||
      waist === undefined ||
      hip === undefined ||
      neck === undefined
    ) {
      toast.error('Preencha todos os campos de medidas')
      return
    }

    const afterUpdate = () => {
      props.onRefetchMeasures()
    }

    updateMeasure(props.measure.id, createNewMeasure({
      ...props.measure,
      height,
      waist,
      hip,
      neck,
      target_timestamp: date,
    }))
      .then(afterUpdate)
      .catch((error) => {
        console.error(error)
        toast.error(
          `Erro ao atualizar medida: ${formatError(error)}`
        )
      })
  }

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateField.value(),
              endDate: dateField.value(),
            }}
            onChange={(value) => {
              if (!value?.startDate) {
                toast.error(`Data inválida: ${JSON.stringify(value)}`)
                return
              }
              // Use dateUtils to adjust to local timezone
              const date = adjustToTimezone(new Date(value.startDate))
              dateField.setRawValue(date.toISOString())
              handleSave({
                date,
                height: heightField.value(),
                waist: waistField.value(),
                hip: hipField.value(),
                neck: neckField.value(),
              })
            }}
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
          <div class="flex justify-between sm:gap-10 px-2">
            <div class="flex flex-col">
              <div class="flex">
                <span class="my-auto">Altura:</span>
                <FloatInput
                  field={heightField}
                  class="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => {
                    event.target.select()
                  }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField.value(),
                      height: value,
                      waist: waistField.value(),
                      hip: hipField.value(),
                      neck: neckField.value(),
                    })
                  }}
                />
                <span class="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div class="flex">
                <span class="my-auto">Cintura:</span>
                <FloatInput
                  field={waistField}
                  class="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => {
                    event.target.select()
                  }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField.value(),
                      height: heightField.value(),
                      waist: value,
                      hip: hipField.value(),
                      neck: neckField.value(),
                    })
                  }}
                />
                <span class="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div class="flex">
                <span class="my-auto">Quadril:</span>
                <FloatInput
                  field={hipField}
                  class="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => {
                    event.target.select()
                  }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField.value(),
                      height: heightField.value(),
                      waist: waistField.value(),
                      hip: value,
                      neck: neckField.value(),
                    })
                  }}
                />
                <span class="my-auto flex-1 hidden sm:block">cm</span>
              </div>
              <div class="flex">
                <span class="my-auto">Pescoço:</span>
                <FloatInput
                  field={neckField}
                  class="input text-center btn-ghost px-0 flex-shrink"
                  style={{ width: '100%' }}
                  onFocus={(event) => {
                    event.target.select()
                  }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateField.value(),
                      height: heightField.value(),
                      waist: waistField.value(),
                      hip: hipField.value(),
                      neck: value,
                    })
                  }}
                />
                <span class="my-auto flex-1 hidden sm:block">cm</span>
              </div>
            </div>
          </div>
          <button
            class="btn btn-ghost my-auto"
            onClick={() => {
              const afterDelete = () => {
                props.onRefetchMeasures()
              }
              deleteMeasure(props.measure.id)
                .then(afterDelete)
                .catch((error) => {
                  console.error(error)
                  toast.error(
                    'Erro ao deletar: \n' + JSON.stringify(error, null, 2),
                  )
                })
            }}
          >
            <TrashIcon />
          </button>
        </CapsuleContent>
      }
      class={'mb-2'}
    />
  )
}
