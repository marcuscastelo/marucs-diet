import { type Accessor, createMemo, type JSXElement, Show } from 'solid-js'

import {
  asFoodItem,
  isFoodItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import { UnifiedItemActions } from '~/sections/unified-item/components/UnifiedItemActions'
import { UnifiedItemChildren } from '~/sections/unified-item/components/UnifiedItemChildren'
import { UnifiedItemHeader } from '~/sections/unified-item/components/UnifiedItemHeader'
import { createEventHandler } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'
import { cn } from '~/shared/cn'
import { createDebug } from '~/shared/utils/createDebug'
import {
  calcUnifiedItemCalories,
  calcUnifiedItemMacros,
} from '~/shared/utils/macroMath'

const debug = createDebug()

export type UnifiedItemViewProps = {
  item: Accessor<UnifiedItem>
  header?: JSXElement | (() => JSXElement)
  nutritionalInfo?: JSXElement | (() => JSXElement)
  class?: string
  mode?: 'edit' | 'read-only' | 'summary'
  handlers: {
    onClick?: (item: UnifiedItem) => void
    onEdit?: (item: UnifiedItem) => void
    onCopy?: (item: UnifiedItem) => void
    onDelete?: (item: UnifiedItem) => void
  }
}

export function UnifiedItemView(props: UnifiedItemViewProps) {
  const isInteractive = () => props.mode !== 'summary'

  return (
    <div
      class={cn(
        'block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700',
        props.class,
      )}
      onClick={(e: MouseEvent) => {
        const handler = createEventHandler(props.handlers.onClick, props.item())
        handler?.(e)
      }}
    >
      <UnifiedItemHeader item={props.item}>
        {typeof props.header === 'function' ? props.header() : props.header}
        {isInteractive() && (
          <UnifiedItemActions item={props.item} handlers={props.handlers} />
        )}
      </UnifiedItemHeader>

      {typeof props.nutritionalInfo === 'function'
        ? props.nutritionalInfo()
        : props.nutritionalInfo}

      <UnifiedItemChildren item={props.item} />

      <Show when={props.item().reference.type === 'food'}>
        <UnifiedItemFavorite foodId={props.item().id} />
      </Show>
    </div>
  )
}

export function UnifiedItemViewNutritionalInfo(props: {
  item: Accessor<UnifiedItem>
}) {
  const calories = createMemo(() => calcUnifiedItemCalories(props.item()))
  const macros = createMemo(() => calcUnifiedItemMacros(props.item()))

  return (
    <div class="flex">
      <MacroNutrientsView macros={macros()} />
      <div class="ml-auto">
        <span class="text-white"> {props.item().quantity}g </span>|
        <span class="text-white"> {calories().toFixed(0)}kcal </span>
      </div>
    </div>
  )
}

export function UnifiedItemFavorite(props: { foodId: number }) {
  debug('UnifiedItemFavorite called', { props })

  const toggleFavorite = (e: MouseEvent) => {
    debug('toggleFavorite', {
      foodId: props.foodId,
      isFavorite: isFoodFavorite(props.foodId),
    })
    setFoodAsFavorite(props.foodId, !isFoodFavorite(props.foodId))
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class="text-3xl text-orange-400 active:scale-105 hover:text-blue-200"
      onClick={toggleFavorite}
    >
      {isFoodFavorite(props.foodId) ? '★' : '☆'}
    </div>
  )
}

// Re-export for backward compatibility
export { UnifiedItemName } from '~/sections/unified-item/components/UnifiedItemName'
