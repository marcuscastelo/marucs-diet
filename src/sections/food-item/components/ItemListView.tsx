import { type Accessor, For } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  UnifiedItemName,
  UnifiedItemView,
  UnifiedItemViewNutritionalInfo,
  type UnifiedItemViewProps,
} from '~/sections/unified-item/components/UnifiedItemView'

export type ItemListViewProps = {
  items: Accessor<readonly Item[]>
  mode?: 'edit' | 'read-only' | 'summary'
  handlers?: {
    onClick?: (item: Item) => void
    onEdit?: (item: Item) => void
    onCopy?: (item: Item) => void
    onDelete?: (item: Item) => void
  }
}

/**
 * Converts an Item to a UnifiedItem for display purposes
 */
function convertItemToUnifiedItem(item: Item): UnifiedItem {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    reference: {
      type: 'food',
      id: item.reference,
      macros: item.macros,
    },
    __type: 'UnifiedItem',
  }
}

/**
 * Converts UnifiedItem back to Item for handler callbacks
 */
function convertUnifiedItemToItem(unifiedItem: UnifiedItem): Item {
  return {
    id: unifiedItem.id,
    name: unifiedItem.name,
    quantity: unifiedItem.quantity,
    reference:
      unifiedItem.reference.type === 'food' ? unifiedItem.reference.id : 0,
    macros:
      unifiedItem.reference.type === 'food'
        ? unifiedItem.reference.macros
        : { carbs: 0, protein: 0, fat: 0 },
    __type: 'Item',
  }
}

/**
 * Converts legacy ItemListView handlers to UnifiedItemView handlers
 */
function convertHandlers(
  handlers?: ItemListViewProps['handlers'],
): UnifiedItemViewProps['handlers'] {
  const defaultHandlers = {
    onClick: undefined,
    onEdit: undefined,
    onCopy: undefined,
    onDelete: undefined,
  }

  if (!handlers) return defaultHandlers

  return {
    onClick: handlers.onClick
      ? (unifiedItem) =>
          handlers.onClick!(convertUnifiedItemToItem(unifiedItem))
      : undefined,
    onEdit: handlers.onEdit
      ? (unifiedItem) => handlers.onEdit!(convertUnifiedItemToItem(unifiedItem))
      : undefined,
    onCopy: handlers.onCopy
      ? (unifiedItem) => handlers.onCopy!(convertUnifiedItemToItem(unifiedItem))
      : undefined,
    onDelete: handlers.onDelete
      ? (unifiedItem) =>
          handlers.onDelete!(convertUnifiedItemToItem(unifiedItem))
      : undefined,
  }
}

export function ItemListView(props: ItemListViewProps) {
  console.debug('[ItemListView] - Rendering legacy wrapper for unified items')

  return (
    <For each={props.items()}>
      {(item) => {
        const unifiedItem = convertItemToUnifiedItem(item)
        return (
          <div class="mt-2">
            <UnifiedItemView
              item={() => unifiedItem}
              header={
                <HeaderWithActions
                  name={<UnifiedItemName item={() => unifiedItem} />}
                />
              }
              nutritionalInfo={
                <UnifiedItemViewNutritionalInfo item={() => unifiedItem} />
              }
              handlers={convertHandlers(props.handlers)}
              mode={props.mode}
            />
          </div>
        )
      }}
    </For>
  )
}
