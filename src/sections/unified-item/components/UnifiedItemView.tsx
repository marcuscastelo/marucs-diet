import { type Accessor, type JSXElement } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { UnifiedItemActions } from '~/sections/unified-item/components/UnifiedItemActions'
import { UnifiedItemChildren } from '~/sections/unified-item/components/UnifiedItemChildren'
import { UnifiedItemHeader } from '~/sections/unified-item/components/UnifiedItemHeader'
import { UnifiedItemNutritionalInfo } from '~/sections/unified-item/components/UnifiedItemNutritionalInfo'
import { createEventHandler } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'
import { cn } from '~/shared/cn'

export type UnifiedItemViewProps = {
  item: Accessor<UnifiedItem>
  class?: string
  mode?: 'edit' | 'read-only' | 'summary'
  primaryActions?: JSXElement
  secondaryActions?: JSXElement
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
        'rounded-lg border border-gray-700 bg-gray-700 p-3 flex flex-col gap-2 shadow hover:cursor-pointer hover:bg-gray-700',
        props.class,
      )}
      onClick={(e: MouseEvent) => {
        const handler = createEventHandler(props.handlers.onClick, props.item())
        handler?.(e)
      }}
    >
      <UnifiedItemHeader
        item={props.item}
        primaryActions={props.primaryActions}
        secondaryActions={props.secondaryActions}
      >
        {isInteractive() && (
          <UnifiedItemActions item={props.item} handlers={props.handlers} />
        )}
      </UnifiedItemHeader>

      <UnifiedItemChildren item={props.item} />

      <UnifiedItemNutritionalInfo item={props.item} />
    </div>
  )
}
