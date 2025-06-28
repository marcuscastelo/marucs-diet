import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'

export type ContextMenuCopyItemProps = {
  onClick: (e: MouseEvent) => void
}

export function ContextMenuCopyItem(props: ContextMenuCopyItemProps) {
  return (
    <ContextMenu.Item
      class="text-left px-4 py-2 hover:bg-gray-700"
      onClick={props.onClick}
    >
      <div class="flex items-center gap-2">
        <CopyIcon size={15} />
        <span>Copiar</span>
      </div>
    </ContextMenu.Item>
  )
}
