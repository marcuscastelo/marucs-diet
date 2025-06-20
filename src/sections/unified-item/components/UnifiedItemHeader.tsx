import { type Accessor, type JSXElement } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { getItemTypeDisplay } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'

export type UnifiedItemHeaderProps = {
  item: Accessor<UnifiedItem>
  children?: JSXElement
}

export function UnifiedItemHeader(props: UnifiedItemHeaderProps) {
  const typeDisplay = () => getItemTypeDisplay(props.item())

  return (
    <div class="flex items-center">
      <div class="flex flex-1 items-center">
        <div class="flex-1">
          <h5
            class={`mb-2 text-lg font-bold tracking-tight ${typeDisplay().color}`}
          >
            <span class="mr-2 cursor-help" title={typeDisplay().label}>
              {typeDisplay().icon}
            </span>
            {props.item().name}
          </h5>
          {props.children}
        </div>
      </div>
    </div>
  )
}
