import { showError } from '~/modules/toast/application/toastManager'
import { deleteWeight, updateWeight } from '~/modules/weight/application/weight'
import { type Weight } from '~/modules/weight/domain/weight'
import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useDateField, useFloatField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { adjustToTimezone, dateToYYYYMMDD } from '~/shared/utils/date'

/**
 * Props for the WeightView component.
 */
export type WeightViewProps = {
  weight: Weight
}

/**
 * Renders a view for displaying and editing a single weight entry.
 * @param props - WeightViewProps
 * @returns SolidJS component
 */
export function WeightView(props: WeightViewProps) {
  const targetTimestampSignal = () => props.weight.target_timestamp
  const dateField = useDateField(targetTimestampSignal)
  const weightSignal = () => props.weight.weight
  const weightField = useFloatField(weightSignal)
  const { show: showConfirmModal } = useConfirmModalContext()
  const handleSave = ({
    dateValue,
    weightValue,
  }: {
    dateValue: Date | undefined
    weightValue: number | undefined
  }) => {
    if (weightValue === undefined) {
      showError('Digite um peso')
      return
    }
    if (dateValue === undefined) {
      showError('Digite uma data')
      return
    }
    void updateWeight(props.weight.id, {
      ...props.weight,
      weight: weightValue,
      target_timestamp: dateValue,
    })
  }
  return (
    <Capsule
      leftContent={
        <CapsuleContent>
          <Datepicker
            value={{
              startDate: dateField.rawValue(),
              endDate: dateField.rawValue(),
            }}
            onChange={(value) => {
              if (value === null || value.startDate === null) {
                showError('Data inválida: \n' + JSON.stringify(value))
                return
              }
              const date = adjustToTimezone(new Date(value.startDate as string))
              dateField.setRawValue(dateToYYYYMMDD(date))
              handleSave({ dateValue: date, weightValue: weightField.value() })
            }}
            displayFormat="DD/MM/YYYY HH:mm"
            asSingle={true}
            useRange={false}
            readOnly={true}
            toggleIcon={() => <></>}
            containerClassName="relative w-full text-gray-700"
            inputClassName="relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full dark:bg-slate-700 dark:text-white/80 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed border-none"
          />
        </CapsuleContent>
      }
      rightContent={
        <div class="ml-0 p-2 text-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center w-full gap-2 sm:gap-1">
          <div class="relative w-full flex items-center">
            <FloatInput
              field={weightField}
              class="input bg-transparent text-end btn-ghost px-0 shrink pr-9 text-xl font-inherit w-full"
              style={{ width: '100%' }}
              onFocus={(e) => e.target.select()}
              onFieldCommit={(value) =>
                handleSave({ dateValue: dateField.value(), weightValue: value })
              }
            />
            <span class="absolute right-2 pointer-events-none select-none text-xl font-inherit text-inherit">
              kg
            </span>
          </div>
          <button
            class="btn cursor-pointer uppercase btn-ghost my-auto focus:ring-2 focus:ring-blue-400 border-none text-white bg-ghost hover:bg-slate-800 py-2 px-2 w-full sm:w-auto"
            onClick={() => {
              showConfirmModal({
                title: 'Confirmar exclusão',
                body: 'Tem certeza que deseja excluir este peso? Esta ação não pode ser desfeita.',
                actions: [
                  {
                    text: 'Cancelar',
                    onClick: () => {},
                  },
                  {
                    text: 'Excluir',
                    primary: true,
                    onClick: () => {
                      void deleteWeight(props.weight.id)
                    },
                  },
                ],
                hasBackdrop: true,
              })
            }}
          >
            <TrashIcon />
          </button>
        </div>
      }
      class={'mb-2'}
    />
  )
}
