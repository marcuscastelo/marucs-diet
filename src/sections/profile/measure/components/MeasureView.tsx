import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { useFloatField, useDateField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import {
  deleteMeasure,
  updateMeasure,
} from '~/modules/measure/application/measure'
import { showError } from '~/shared/toast/toastManager'
import { formatError } from '~/shared/formatError'
import { adjustToTimezone } from '~/shared/utils/date/dateUtils'
import {
  createNewMeasure,
  type Measure,
} from '~/modules/measure/domain/measure'

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
  const dateField = useDateField(() => props.measure.target_timestamp, {
    fallback: () => new Date(),
  })
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
      showError('Preencha todos os campos de medidas', {
        context: 'user-action',
      })
      return
    }
    const afterUpdate = () => {
      props.onRefetchMeasures()
    }
    updateMeasure(
      props.measure.id,
      createNewMeasure({
        ...props.measure,
        height,
        waist,
        hip,
        neck,
        targetTimestamp: date,
      }),
    )
      .then(afterUpdate)
      .catch((error) => {
        console.error(error)
        showError(`Erro ao atualizar medida: ${formatError(error)}`, {
          context: 'user-action',
        })
      })
  }

  const handleDelete = () => {
    const afterDelete = () => {
      props.onRefetchMeasures()
    }
    deleteMeasure(props.measure.id)
      .then(afterDelete)
      .catch((error) => {
        console.error(error)
        showError('Erro ao deletar: \n' + JSON.stringify(error, null, 2), {
          context: 'user-action',
        })
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
              if (value?.startDate === undefined || value?.startDate === null) {
                showError(`Data inválida: ${JSON.stringify(value)}`, {
                  context: 'user-action',
                })
                return
              }
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
            <MeasureFields
              heightField={heightField}
              waistField={waistField}
              hipField={hipField}
              neckField={neckField}
              onSave={handleSave}
              getDate={dateField.value}
            />
          </div>
          <DeleteButton onDelete={handleDelete} />
        </CapsuleContent>
      }
      class={'mb-2'}
    />
  )
}

function MeasureFields(props: {
  heightField: ReturnType<typeof useFloatField>
  waistField: ReturnType<typeof useFloatField>
  hipField: ReturnType<typeof useFloatField>
  neckField: ReturnType<typeof useFloatField>
  onSave: (field: {
    date: Date
    height: number | undefined
    waist: number | undefined
    hip: number | undefined
    neck: number | undefined
  }) => void
  getDate: () => Date
}) {
  return (
    <div class="flex flex-col">
      <div class="flex">
        <span class="my-auto">Altura:</span>
        <FloatInput
          field={props.heightField}
          class="input text-center btn-ghost px-0 flex-shrink"
          style={{ width: '100%' }}
          onFocus={(event) => {
            event.target.select()
          }}
          onFieldCommit={(value) => {
            props.onSave({
              date: props.getDate(),
              height: value,
              waist: props.waistField.value(),
              hip: props.hipField.value(),
              neck: props.neckField.value(),
            })
          }}
        />
        <span class="my-auto flex-1 hidden sm:block">cm</span>
      </div>
      <div class="flex">
        <span class="my-auto">Cintura:</span>
        <FloatInput
          field={props.waistField}
          class="input text-center btn-ghost px-0 flex-shrink"
          style={{ width: '100%' }}
          onFocus={(event) => {
            event.target.select()
          }}
          onFieldCommit={(value) => {
            props.onSave({
              date: props.getDate(),
              height: props.heightField.value(),
              waist: value,
              hip: props.hipField.value(),
              neck: props.neckField.value(),
            })
          }}
        />
        <span class="my-auto flex-1 hidden sm:block">cm</span>
      </div>
      <div class="flex">
        <span class="my-auto">Quadril:</span>
        <FloatInput
          field={props.hipField}
          class="input text-center btn-ghost px-0 flex-shrink"
          style={{ width: '100%' }}
          onFocus={(event) => {
            event.target.select()
          }}
          onFieldCommit={(value) => {
            props.onSave({
              date: props.getDate(),
              height: props.heightField.value(),
              waist: props.waistField.value(),
              hip: value,
              neck: props.neckField.value(),
            })
          }}
        />
        <span class="my-auto flex-1 hidden sm:block">cm</span>
      </div>
      <div class="flex">
        <span class="my-auto">Pescoço:</span>
        <FloatInput
          field={props.neckField}
          class="input text-center btn-ghost px-0 flex-shrink"
          style={{ width: '100%' }}
          onFocus={(event) => {
            event.target.select()
          }}
          onFieldCommit={(value) => {
            props.onSave({
              date: props.getDate(),
              height: props.heightField.value(),
              waist: props.waistField.value(),
              hip: props.hipField.value(),
              neck: value,
            })
          }}
        />
        <span class="my-auto flex-1 hidden sm:block">cm</span>
      </div>
    </div>
  )
}

function DeleteButton(props: { onDelete: () => void }) {
  return (
    <button
      class="btn btn-ghost my-auto"
      onClick={() => {
        props.onDelete()
      }}
    >
      <TrashIcon />
    </button>
  )
}
