import { type Accessor, For } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  ItemGroupName,
  ItemGroupView,
  ItemGroupViewNutritionalInfo,
  type ItemGroupViewProps,
} from '~/sections/item-group/components/ItemGroupView'

export type ItemGroupListViewProps = {
  itemGroups: Accessor<ItemGroup[]>
} & Omit<ItemGroupViewProps, 'itemGroup' | 'header' | 'nutritionalInfo'>

export function ItemGroupListView(props: ItemGroupListViewProps) {
  console.debug('[ItemGroupListView] - Rendering')
  return (
    <For each={props.itemGroups()}>
      {(group) => (
        <div class="mt-2">
          <ItemGroupView
            itemGroup={() => group}
            header={
              <HeaderWithActions name={<ItemGroupName group={() => group} />} />
            }
            nutritionalInfo={
              <ItemGroupViewNutritionalInfo group={() => group} />
            }
            {...props}
          />
        </div>
      )}
    </For>
  )
}
