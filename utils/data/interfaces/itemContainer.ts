import { FoodItem } from '@/model/foodItemModel'
import { ItemEditor } from '../itemEditor'

export interface ItemContainer {
  addItem(item: FoodItem): void
  addItems(items: FoodItem[]): void
  findItem(id: FoodItem['id']): FoodItem | undefined
  editItem(
    id: FoodItem['id'],
    callback: (editor: Omit<ItemEditor, 'finish'> | undefined) => void,
  ): void
  deleteItem(id: FoodItem['id']): void
  clearItems(): void
}
