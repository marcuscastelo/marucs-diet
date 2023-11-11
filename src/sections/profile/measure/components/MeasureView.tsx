import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { type Measure } from '~/modules/measure/domain/measure'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import {
  deleteMeasure,
  updateMeasure,
} from '~/modules/measure/application/measure'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

export function MeasureView(props: {
  measure: Measure
  onRefetchMeasures: () => void
}) {
  // TODO: Replace this with useDateField
  const [dateFieldValue, setDateFieldValue] = createMirrorSignal(
    () => props.measure.target_timestamp,
  )

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
      alert('Medidas inválidas') // TODO: Change all alerts with ConfirmModal
      return
    }

    const afterUpdate = () => {
      props.onRefetchMeasures()
    }

    updateMeasure(props.measure.id, {
      ...props.measure,
      height,
      waist,
      hip,
      neck,
      target_timestamp: date,
    })
      .then(afterUpdate)
      .catch((error) => {
        console.error(error)
        alert('Erro ao atualizar') // TODO: Change all alerts with ConfirmModal
      })
  }

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateFieldValue(),
              endDate: dateFieldValue(),
            }}
            onChange={(value) => {
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (!value?.startDate) {
                alert('Data inválida') // TODO: Change all alerts with ConfirmModal
                return
              }
              // Apply timezone offset
              const date = new Date(value.startDate)
              date.setHours(date.getHours() + 3)
              setDateFieldValue(date)

              handleSave({
                date,
                height: heightField.value(),
                waist: waistField.value(),
                hip: hipField.value(),
                neck: neckField.value(),
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
                      date: dateFieldValue(),
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
                      date: dateFieldValue(),
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
                      date: dateFieldValue(),
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
                      date: dateFieldValue(),
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
                  alert('Erro ao deletar') // TODO: Change all alerts with ConfirmModal
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
