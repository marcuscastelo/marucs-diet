import { searchCachedFoodsByName } from '@/controllers/food'
import { createFoodItem } from '@/model/foodItemModel'
import SimpleFoodItemListView from './SimpleFoodItemListView'
import MyFoodSearchBar from './MyFoodSearchBar'

export default async function Page() {
  const foods = await searchCachedFoodsByName('frango', 10)

  const displays = foods.map((food) =>
    createFoodItem({
      name: food.name,
      reference: food.id,
    }),
  )

  return (
    <div>
      <MyFoodSearchBar />
      <SimpleFoodItemListView foodItems={displays} />
    </div>
  )
}
