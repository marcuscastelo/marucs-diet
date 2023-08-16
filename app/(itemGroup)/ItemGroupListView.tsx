'use client'

import { ItemGroup } from '@/model/foodItemGroupModel'
import ItemGroupView, { ItemGroupViewProps } from './ItemGroupView'

export default function ItemGroupListView({
  itemGroups,
  onItemClick,
}: {
  itemGroups: ItemGroup[]
  onItemClick: ItemGroupViewProps['onClick']
}) {
  return (
    <>
      {itemGroups.map((item) => (
        <div key={item.id} className="mt-2">
          <ItemGroupView
            itemGroup={item}
            onClick={onItemClick}
            header={
              <ItemGroupView.Header
                name={<ItemGroupView.Header.Name />}
                copyButton={
                  <ItemGroupView.Header.CopyButton
                    handleCopyMealItem={(item) => {
                      navigator.clipboard.writeText(JSON.stringify(item))
                    }}
                  />
                }
              />
            }
            nutritionalInfo={<ItemGroupView.NutritionalInfo />}
          />
        </div>
      ))}
    </>
  )
}
