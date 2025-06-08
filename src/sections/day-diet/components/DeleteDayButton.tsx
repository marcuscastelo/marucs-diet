import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { deleteDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type Accessor } from 'solid-js'

export function DeleteDayButton(props: { day: Accessor<DayDiet> }) {
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <button
      class="btn-error btn cursor-pointer uppercase mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
      onClick={() => {
        showConfirmModal({
          title: 'Excluir dia',
          body: 'Tem certeza que deseja excluir este dia?',
          actions: [
            {
              text: 'Cancelar',
              onClick: () => undefined,
            },
            {
              text: 'Excluir dia',
              primary: true,
              onClick: () => {
                deleteDayDiet(props.day().id).catch((error) => {
                  console.error('Error deleting day', error)
                  throw error
                })
              },
            },
          ],
        })
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
