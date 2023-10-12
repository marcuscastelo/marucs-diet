'use client'

import { ItemGroup } from '@/model/itemGroupModel'
import ItemGroupView, { ItemGroupViewProps } from './ItemGroupView'
import { ReadonlySignal, computed } from '@preact/signals-react'

export default function ItemGroupListView({
  itemGroups,
  onItemClick,
}: {
  itemGroups: ReadonlySignal<ItemGroup[]>
  onItemClick: ItemGroupViewProps['onClick']
}) {
  return (
    <>
      {itemGroups.value.map((_, idx) => {
        const item = computed(() => itemGroups.value[idx])
        return (
          <div key={item.value.id} className="mt-2">
            <ItemGroupView
              itemGroup={item}
              onClick={onItemClick}
              header={
                <ItemGroupView.Header
                  name={<ItemGroupView.Header.Name />}
                  copyButton={
                    <ItemGroupView.Header.CopyButton
                      onCopyItemGroup={(group) => {
                        // TOOD: Replace with clipboard hook (here and in FoodItemView, if applicable)
                        navigator.clipboard.writeText(JSON.stringify(group))
                      }}
                    />
                  }
                />
              }
              nutritionalInfo={<ItemGroupView.NutritionalInfo />}
            />
          </div>
        )
      })}
    </>
  )
}
