import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { deleteDayDiet } from '@/modules/diet/day-diet/application/dayDiet'
import { type Accessor } from 'solid-js'

export function DeleteDayButton (props: {
  day: Accessor<DayDiet | null | undefined>
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <button
      class="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
      onClick={() => {
        showConfirmModal({
          title: 'Excluir dia',
          body: 'Tem certeza que deseja excluir este dia?',
          actions: [
            {
              text: 'Cancelar',
              onClick: () => undefined
            },
            {
              text: 'Excluir dia',
              primary: true,
              onClick: () => {
                const day_ = props.day()
                if (day_ !== null && day_ !== undefined) {
                  deleteDayDiet(day_.id)
                } else {
                  console.error('Day is null')
                  throw new Error('Day is null')
                }
              }
            }
          ]
        })
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
