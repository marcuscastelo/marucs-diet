import { type Accessor, Show } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ContextMenu } from '~/sections/common/components/ContextMenu'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { MoreVertIcon } from '~/sections/common/components/icons/MoreVertIcon'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
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

  return (
    <ContextMenu
      trigger={
        <div class="text-3xl active:scale-105 hover:text-blue-200">
          <MoreVertIcon />
        </div>
      }
      class="ml-2"
    >
      <Show when={getHandlers().onEdit}>
        {(onEdit) => (
          <ContextMenu.Item
            class="text-left px-4 py-2 hover:bg-gray-700"
            onClick={onEdit()}
          >
            <div class="flex items-center gap-2">
              <span class="text-blue-500">✏️</span>
              <span>Editar</span>
            </div>
          </ContextMenu.Item>
        )}
      </Show>
      <Show when={getHandlers().onCopy}>
        {(onCopy) => (
          <ContextMenu.Item
            class="text-left px-4 py-2 hover:bg-gray-700"
            onClick={onCopy()}
          >
            <div class="flex items-center gap-2">
              <CopyIcon size={15} />
              <span>Copiar</span>
            </div>
          </ContextMenu.Item>
        )}
      </Show>
      <Show when={getHandlers().onDelete}>
        {(onDelete) => (
          <ContextMenu.Item
            class="text-left px-4 py-2 text-red-400 hover:bg-gray-700"
            onClick={onDelete()}
          >
            <div class="flex items-center gap-2">
              <span class="text-red-400">
                <TrashIcon size={15} />
              </span>
              <span class="text-red-400">Excluir</span>
            </div>
          </ContextMenu.Item>
        )}
      </Show>
    </ContextMenu>
  )
}
