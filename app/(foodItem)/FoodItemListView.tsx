'use client'

import { FoodItem } from '@/model/foodItemModel'
import FoodItemView, { FoodItemViewProps } from './FoodItemView'

export default function FoodItemListView({
  foodItems,
  onItemClick,
}: {
  foodItems: FoodItem[]
  onItemClick: FoodItemViewProps['onClick']
}) {
  return (
    <>
      {foodItems.map((item) => (
        <div key={item.id} className="mt-2">
          <FoodItemView
            foodItem={item}
            onClick={onItemClick}
            header={
              <FoodItemView.Header
                name={<FoodItemView.Header.Name />}
                copyButton={
                  <FoodItemView.Header.CopyButton
                    handleCopyMealItem={(item) => {
                      navigator.clipboard.writeText(JSON.stringify(item))
                    }}
                  />
                }
              />
            }
            nutritionalInfo={<FoodItemView.NutritionalInfo />}
          />
        </div>
      ))}
    </>
  )
}
