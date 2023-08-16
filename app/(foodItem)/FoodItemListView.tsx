'use client'

import { FoodItem } from '@/model/foodItemModel'
import FoodItemView, { FoodItemViewProps } from './FoodItemView'

export default function FoodItemListView({
  foodItems,
  onItemClick,
  makeHeaderFn = () => <DefaultHeader />,
}: {
  foodItems: FoodItem[]
  onItemClick?: FoodItemViewProps['onClick']
  makeHeaderFn?: (item: FoodItem) => FoodItemViewProps['header']
}) {
  return (
    <>
      {foodItems.map((item) => (
        <div key={item.id} className="mt-2">
          <FoodItemView
            foodItem={item}
            onClick={onItemClick}
            header={makeHeaderFn(item)}
            nutritionalInfo={<FoodItemView.NutritionalInfo />}
          />
        </div>
      ))}
    </>
  )
}

function DefaultHeader() {
  return (
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
  )
}
