import { type Accessor, type JSXElement, Show } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { UnifiedItemName } from '~/sections/unified-item/components/UnifiedItemName'

export type UnifiedItemHeaderProps = {
  item: Accessor<UnifiedItem>
  children?: JSXElement
  primaryActions?: JSXElement
  secondaryActions?: JSXElement
}

export function UnifiedItemHeader(props: UnifiedItemHeaderProps) {
  return (
    <div class="flex justify-between items-center ">
      <div class="flex flex-1 items-center">
        <div class="flex-1 flex justify-between">
          <UnifiedItemName item={props.item} />
          {props.children}
        </div>
      </div>
      <div class="flex flex-col">
        <Show when={props.secondaryActions}>
          <div class="flex gap-2 items-center">{props.secondaryActions}</div>
        </Show>
        <Show when={props.primaryActions}>
          <div class="flex gap-2 items-center">{props.primaryActions}</div>
        </Show>
      </div>
    </div>
  )
}
