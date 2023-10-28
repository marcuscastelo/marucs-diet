'use client'

import { FoodItem } from '@/src/modules/diet/food-item/domain/foodItem'
import FoodItemView, {
  FoodItemViewProps,
} from '@/sections/food-item/components/FoodItemView'
import { ReadonlySignal, computed } from '@preact/signals-react'

export default function FoodItemListView({
  foodItems,
  onItemClick,
  makeHeaderFn = () => <DefaultHeader />,
}: {
  foodItems: ReadonlySignal<readonly FoodItem[]>
  onItemClick: FoodItemViewProps['onClick']
  makeHeaderFn?: (item: FoodItem) => FoodItemViewProps['header']
}) {
  return (
    <>
      {foodItems.value.map((_, idx) => {
        const item = computed(() => foodItems.value[idx])
        return (
          <div key={item.value.id} className="mt-2">
            <FoodItemView
              foodItem={item}
              onClick={onItemClick}
              header={makeHeaderFn(item.value)}
              nutritionalInfo={<FoodItemView.NutritionalInfo />}
            />
          </div>
        )
      })}
    </>
  )
}

function DefaultHeader() {
  return (
    <FoodItemView.Header
      name={<FoodItemView.Header.Name />}
      copyButton={
        <FoodItemView.Header.CopyButton
          onCopyItem={(item) => {
            navigator.clipboard.writeText(JSON.stringify(item))
          }}
        />
      }
    />
  )
}
