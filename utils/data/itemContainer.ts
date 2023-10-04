import { FoodItem } from '@/model/foodItemModel'

export interface ItemContainer {
  addItem(item: FoodItem): void
  addItems(items: FoodItem[]): void
  clearItems(): void
}
