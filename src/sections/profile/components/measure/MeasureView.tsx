import { Capsule } from '@/sections/common/components/capsule/Capsule'
import { TrashIcon } from '@/sections/common/components/icons/TrashIcon'
import { type Measure } from '@/modules/measure/domain/measure'
import { deleteMeasure, updateMeasure } from '@/legacy/controllers/measures'
import { CapsuleContent } from '@/sections/common/components/capsule/CapsuleContent'
import { useFloatFieldOld } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { createSignal } from 'solid-js'

export function MeasureView (props: {
  measure: Measure
  onRefetchMeasures: () => void
  onSave: () => void
}) {
  const [dateFieldValue, setDateFieldValue] = createSignal<Date>(props.measure.target_timestamp)

  const heightField = useFloatFieldOld(props.measure.height)
  const waistField = useFloatFieldOld(props.measure.waist)
  const hipField = useFloatFieldOld(props.measure.hip)
  const neckField = useFloatFieldOld(props.measure.neck)

  const handleSave =
    ({
      date,
      height,
      waist,
      hip,
      neck
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

      updateMeasure(props.measure.id, {
        ...props.measure,
        height,
        waist,
        hip,
        neck,
        target_timestamp: date
      }).then(() => {
        props.onSave()
        props.onRefetchMeasures()
      }).catch((error) => {
        console.error(error)
        alert('Erro ao salvar') // TODO: Change all alerts with ConfirmModal
      })
    }

  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          // TODO: Datepicker without router
          {/* <DatePicker
            value={{
              startDate: dateField,
              endDate: dateField
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
                neck: neckField.value.value
              })
            }}
            // Timezone = GMT-3
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            containerClassName="relative w-full text-gray-700"
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
          /> */}
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
                  onFocus={(event) => { event.target.select() }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateFieldValue(),
                      height: value,
                      waist: waistField.value(),
                      hip: hipField.value(),
                      neck: neckField.value()
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
                  onFocus={(event) => { event.target.select() }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateFieldValue(),
                      height: heightField.value(),
                      waist: value,
                      hip: hipField.value(),
                      neck: neckField.value()
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
                  onFocus={(event) => { event.target.select() }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateFieldValue(),
                      height: heightField.value(),
                      waist: waistField.value(),
                      hip: value,
                      neck: neckField.value()
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
                  onFocus={(event) => { event.target.select() }}
                  onFieldCommit={(value) => {
                    handleSave({
                      date: dateFieldValue(),
                      height: heightField.value(),
                      waist: waistField.value(),
                      hip: hipField.value(),
                      neck: value
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
              deleteMeasure(props.measure.id).then(() => {
                props.onRefetchMeasures()
                props.onSave()
              }).catch((error) => {
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
