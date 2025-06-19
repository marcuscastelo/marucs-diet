import { type Accessor, For } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  UnifiedItemName,
  UnifiedItemView,
  UnifiedItemViewNutritionalInfo,
  type UnifiedItemViewProps,
} from '~/sections/unified-item/components/UnifiedItemView'

export type UnifiedItemListViewProps = {
  items: Accessor<UnifiedItem[]>
} & Omit<UnifiedItemViewProps, 'item' | 'header' | 'nutritionalInfo'>

export function UnifiedItemListView(props: UnifiedItemListViewProps) {
  console.debug('[UnifiedItemListView] - Rendering')
  return (
    <For each={props.items()}>
      {(item) => (
        <div class="mt-2">
          <UnifiedItemView
            item={() => item}
            header={
              <HeaderWithActions name={<UnifiedItemName item={() => item} />} />
            }
            nutritionalInfo={
              <UnifiedItemViewNutritionalInfo item={() => item} />
            }
            {...props}
          />
        </div>
      )}
    </For>
  )
}
