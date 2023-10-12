import { FoodItem } from '@/model/foodItemModel'
import { ItemContainer } from './interfaces/itemContainer'
import { ItemGroup } from '@/model/itemGroupModel'
import { Editor } from './editor'
import { ItemEditor } from './itemEditor'
import { Mutable } from '../typeUtils'

export class ItemGroupEditor
  extends Editor<ItemGroup>
  implements ItemContainer
{
  private readonly group = this.content

  addItem(item: FoodItem) {
    this.group.items.push(item)
    return this
  }

  addItems(items: FoodItem[]) {
    this.group.items.push(...items)
    return this
  }

  findItem(id: number) {
    return this.group.items.find((item) => item.id === id)
  }

  editItem(
    id: number,
    callback: (editor: Omit<ItemEditor, 'finish'> | undefined) => void,
  ) {
    const item = this.findItem(id)
    const editor = item && new ItemEditor(item)
    callback(editor)
    const newItem = editor?.finish()
    if (newItem) {
      const index = this.group.items.findIndex((item) => item.id === id)
      this.group.items.splice(index, 1, newItem)
    }
    return this
  }

  deleteItem(id: number): void {
    const index = this.group.items.findIndex((item) => item.id === id)
    if (index === -1) {
      console.warn(`Item with id ${id} not found!`)
      return
    }
    this.group.items.splice(index, 1)
  }

  clearItems() {
    this.group.items = []
    return this
  }

  protected override onFinish() {
    // TODO: Replace quantity field with a getter that calculates it
    this.group.quantity = this.group.items.reduce(
      (acc, item) => acc + item.quantity,
      0,
    )
  }
}
