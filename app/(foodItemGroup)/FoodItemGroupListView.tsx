'use client'

import { FoodItemGroup } from '@/model/foodItemGroupModel'
import FoodItemGroupView, { FoodItemGroupViewProps } from './FoodItemGroupView'

export default function FoodItemGroupListView({
  foodItems: foodItemGroups,
  onItemClick,
}: {
  foodItems: FoodItemGroup[]
  onItemClick: FoodItemGroupViewProps['onClick']
}) {
  return (
    <>
      {foodItemGroups.map((item) => (
        <div key={item.id} className="mt-2">
          <FoodItemGroupView
            foodItemGroup={item}
            onClick={onItemClick}
            header={
              <FoodItemGroupView.Header
                name={<FoodItemGroupView.Header.Name />}
                copyButton={
                  <FoodItemGroupView.Header.CopyButton
                    handleCopyMealItem={(item) => {
                      navigator.clipboard.writeText(JSON.stringify(item))
                    }}
                  />
                }
              />
            }
            nutritionalInfo={<FoodItemGroupView.NutritionalInfo />}
          />
        </div>
      ))}
    </>
  )
}
