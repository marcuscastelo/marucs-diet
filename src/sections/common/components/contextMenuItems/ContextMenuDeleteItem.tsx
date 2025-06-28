import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'

export type ContextMenuDeleteItemProps = {
  onClick: (e: MouseEvent) => void
}

export function ContextMenuDeleteItem(props: ContextMenuDeleteItemProps) {
  return (
    <ContextMenu.Item
      class="text-left px-4 py-2 text-red-400 hover:bg-gray-700"
      onClick={props.onClick}
    >
      <div class="flex items-center gap-2">
        <span class="text-red-400">
          <TrashIcon size={15} />
        </span>
        <span class="text-red-400">Excluir</span>
      </div>
    </ContextMenu.Item>
  )
}
