import { type Accessor, For, Show } from 'solid-js'

import {
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { calcUnifiedItemCalories } from '~/shared/utils/macroMath'

export type UnifiedItemChildrenProps = {
  item: Accessor<UnifiedItem>
}

export function UnifiedItemChildren(props: UnifiedItemChildrenProps) {
  const hasChildren = () => {
    const item = props.item()
    return (
      (isRecipeItem(item) || isGroupItem(item)) &&
      Array.isArray(item.reference.children) &&
      item.reference.children.length > 0
    )
  }

  const getChildren = () => {
    const item = props.item()
    if (isRecipeItem(item) || isGroupItem(item)) {
      return item.reference.children
    }
    return []
  }

  return (
    <Show when={hasChildren()}>
      <div class="mt-2 ml-4 space-y-1">
        <For each={getChildren()}>
          {(child) => (
            <div class="text-sm text-gray-300 flex justify-between">
              <span>
                {child.name} ({child.quantity}g)
              </span>
              <span class="text-gray-400">
                {calcUnifiedItemCalories(child).toFixed(0)}kcal
              </span>
            </div>
          )}
        </For>
      </div>
    </Show>
  )
}
