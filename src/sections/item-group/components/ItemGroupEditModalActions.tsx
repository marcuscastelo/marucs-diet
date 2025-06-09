import { type Accessor, type Setter, Show } from 'solid-js'

import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useItemGroupEditContext } from '~/sections/item-group/context/ItemGroupEditContext'

/**
 * Actions component for ItemGroupEditModal footer.
 * @param props - Actions props
 * @returns JSX.Element
 */
export function ItemGroupEditModalActions(props: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  canApply: boolean
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  const { group, saveGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <>
      <Show when={props.onDelete}>
        {(onDelete) => (
          <button
            class="btn-error btn cursor-pointer uppercase mr-auto"
            onClick={(e) => {
              e.preventDefault()
              showConfirmModal({
                title: 'Excluir grupo',
                body: `Tem certeza que deseja excluir o grupo ${group().name}?`,
                actions: [
                  {
                    text: 'Cancelar',
                    onClick: () => undefined,
                  },
                  {
                    text: 'Excluir',
                    primary: true,
                    onClick: () => {
                      onDelete()(group().id)
                    },
                  },
                ],
              })
            }}
          >
            Excluir
          </button>
        )}
      </Show>
      <button
        class="btn cursor-pointer uppercase"
        onClick={(e) => {
          e.preventDefault()
          props.setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn cursor-pointer uppercase"
        disabled={!props.canApply}
        onClick={(e) => {
          e.preventDefault()
          saveGroup()
        }}
      >
        Aplicar
      </button>
    </>
  )
}
