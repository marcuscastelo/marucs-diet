import { type Accessor, Show } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { ContextMenuCopyItem } from '~/sections/common/components/contextMenuItems/ContextMenuCopyItem'
import { ContextMenuDeleteItem } from '~/sections/common/components/contextMenuItems/ContextMenuDeleteItem'
import { ContextMenuEditItem } from '~/sections/common/components/contextMenuItems/ContextMenuEditItem'
import { MoreVertIcon } from '~/sections/common/components/icons/MoreVertIcon'
import { createEventHandler } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'

export type UnifiedItemActionsProps = {
  item: Accessor<UnifiedItem>
  handlers: {
    onEdit?: (item: UnifiedItem) => void
    onCopy?: (item: UnifiedItem) => void
    onDelete?: (item: UnifiedItem) => void
  }
}

export function UnifiedItemActions(props: UnifiedItemActionsProps) {
  const getHandlers = () => ({
    onEdit: createEventHandler(props.handlers.onEdit, props.item()),
    onCopy: createEventHandler(props.handlers.onCopy, props.item()),
    onDelete: createEventHandler(props.handlers.onDelete, props.item()),
  })

  const hasAnyHandler = () =>
    getHandlers().onEdit || getHandlers().onCopy || getHandlers().onDelete

  return (
    <Show when={hasAnyHandler()}>
      <ContextMenu
        trigger={
          <div class="text-3xl active:scale-105 hover:text-blue-200">
            <MoreVertIcon />
          </div>
        }
        class="ml-2"
      >
        <Show when={getHandlers().onEdit}>
          {(onEdit) => <ContextMenuEditItem onClick={onEdit()} />}
        </Show>
        <Show when={getHandlers().onCopy}>
          {(onCopy) => <ContextMenuCopyItem onClick={onCopy()} />}
        </Show>
        <Show when={getHandlers().onDelete}>
          {(onDelete) => <ContextMenuDeleteItem onClick={onDelete()} />}
        </Show>
      </ContextMenu>
    </Show>
  )
}
