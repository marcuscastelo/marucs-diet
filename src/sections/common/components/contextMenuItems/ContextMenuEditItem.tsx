import { ContextMenu } from '~/sections/common/components/ContextMenu'

export type ContextMenuEditItemProps = {
  onClick: (e: MouseEvent) => void
}

export function ContextMenuEditItem(props: ContextMenuEditItemProps) {
  return (
    <ContextMenu.Item
      class="text-left px-4 py-2 hover:bg-gray-700"
      onClick={props.onClick}
    >
      <div class="flex items-center gap-2">
        <span class="text-blue-500">✏️</span>
        <span>Editar</span>
      </div>
    </ContextMenu.Item>
  )
}
