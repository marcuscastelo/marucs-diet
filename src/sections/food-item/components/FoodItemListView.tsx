import { type FoodItem } from '@/modules/diet/food-item/domain/foodItem'
import {
  FoodItemView,
  FoodItemCopyButton,
  FoodItemHeader,
  FoodItemName,
  FoodItemNutritionalInfo,
  type FoodItemViewProps
} from '@/sections/food-item/components/FoodItemView'
import { mergeProps, type Accessor } from 'solid-js'

export function FoodItemListView (_props: {
  foodItems: Accessor<readonly FoodItem[]>
  onItemClick: FoodItemViewProps['onClick']
  makeHeaderFn?: (item: FoodItem) => FoodItemViewProps['header']
}) {
  const props = mergeProps({ makeHeaderFn: () => <DefaultHeader /> }, _props)
  return (
    <>
      {props.foodItems().map((_, idx) => {
        const item = () => props.foodItems()[idx]
        return (
          <div class="mt-2">
            <FoodItemView
              foodItem={item}
              onClick={props.onItemClick}
              header={props.makeHeaderFn(item())}
              nutritionalInfo={<FoodItemNutritionalInfo />}
            />
          </div>
        )
      })}
    </>
  )
}

function DefaultHeader () {
  return (
    <FoodItemHeader
      name={<FoodItemName />}
      copyButton={
        <FoodItemCopyButton
          onCopyItem={(item) => {
            navigator.clipboard.writeText(JSON.stringify(item)).catch(() => {
              console.error('Failed to copy item to clipboard')
            })
          }}
        />
      }
    />
  )
}
