import { type FoodItem } from '~/modules/diet/food-item/domain/foodItem'
import { type ItemEditor } from '~/legacy/utils/data/itemEditor'

export type ItemContainer = {
  addItem: (item: FoodItem) => void
  addItems: (items: FoodItem[]) => void
  findItem: (id: FoodItem['id']) => FoodItem | undefined
  editItem: (
    id: FoodItem['id'],
    callback: (editor: Omit<ItemEditor, 'finish'> | undefined) => void,
  ) => void
  editItems: (
    callback: (
      id: number,
      editor: Omit<ItemEditor, 'finish'> | undefined,
    ) => void,
  ) => void
  setItems: (items: FoodItem[]) => void
  deleteItem: (id: FoodItem['id']) => void
  clearItems: () => void
}
