import { type Item } from '~/modules/diet/food-item/domain/foodItem'
import { type ItemEditor } from '~/legacy/utils/data/itemEditor'

export type ItemContainer = {
  addItem: (item: Item) => void
  addItems: (items: Item[]) => void
  findItem: (id: Item['id']) => Item | undefined
  editItem: (
    id: Item['id'],
    callback: (editor: Omit<ItemEditor, 'finish'> | undefined) => void,
  ) => void
  editItems: (
    callback: (
      id: number,
      editor: Omit<ItemEditor, 'finish'> | undefined,
    ) => void,
  ) => void
  setItems: (items: Item[]) => void
  deleteItem: (id: Item['id']) => void
  clearItems: () => void
}
