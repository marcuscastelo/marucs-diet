import { type Accessor, type JSXElement } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { UnifiedItemName } from '~/sections/unified-item/components/UnifiedItemName'

export type UnifiedItemHeaderProps = {
  item: Accessor<UnifiedItem>
  children?: JSXElement
}

export function UnifiedItemHeader(props: UnifiedItemHeaderProps) {
  return (
    <div class="flex items-center">
      <div class="flex flex-1 items-center">
        <div class="flex-1">
          <UnifiedItemName item={props.item} />
          {props.children}
        </div>
      </div>
    </div>
  )
}
