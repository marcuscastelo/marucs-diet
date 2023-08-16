'use client'

import FoodItemListView from '@/app/(foodItem)/FoodItemListView'
import { FoodItem } from '@/model/foodItemModel'

export default function SimpleFoodItemListView({
  foodItems,
}: {
  foodItems: FoodItem[]
}) {
  return (
    <FoodItemListView
      foodItems={foodItems}
      makeHeaderFn={(item) => <h1>{item.name}</h1>}
    />
  )
}
