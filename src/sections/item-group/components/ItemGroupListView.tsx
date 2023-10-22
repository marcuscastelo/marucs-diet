'use client'

import { ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import ItemGroupView, {
  ItemGroupViewProps,
} from '@/sections/item-group/components/ItemGroupView'
import { ReadonlySignal, computed } from '@preact/signals-react'

export default function ItemGroupListView({
  itemGroups,
  onItemClick,
}: {
  itemGroups: ReadonlySignal<ItemGroup[]>
  onItemClick: ItemGroupViewProps['onClick']
}) {
  console.debug(`[ItemGroupListView] - Rendering`)
  return (
    <>
      {itemGroups.value.map((_, idx) => {
        const group = computed(() => itemGroups.value[idx])
        return (
          <div key={group.value.id} className="mt-2">
            <ItemGroupView
              itemGroup={group}
              onClick={onItemClick}
              header={
                <ItemGroupView.Header
                  name={<ItemGroupView.Header.Name group={group} />}
                  copyButton={
                    <ItemGroupView.Header.CopyButton
                      group={group}
                      onCopyItemGroup={(group) => {
                        // TODO: Replace with clipboard hook (here and in FoodItemView, if applicable)
                        navigator.clipboard.writeText(JSON.stringify(group))
                      }}
                    />
                  }
                />
              }
              nutritionalInfo={<ItemGroupView.NutritionalInfo group={group} />}
            />
          </div>
        )
      })}
    </>
  )
}
