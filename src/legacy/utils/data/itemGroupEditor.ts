import { type FoodItem } from '@/modules/diet/food-item/domain/foodItem'
import { type ItemContainer } from '@/legacy/utils/data/interfaces/itemContainer'
import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { Editor } from '@/legacy/utils/data/editor'
import { ItemEditor } from '@/legacy/utils/data/itemEditor'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { deepCopy } from '@/legacy/utils/deepCopy'
import { type Mutable } from '@/legacy/utils/typeUtils'

export class ItemGroupEditor
  extends Editor<ItemGroup>
  implements ItemContainer
{
  private readonly group = this.content

  setName(name: string) {
    this.group.name = name
    return this
  }

  setRecipe(recipe: Recipe['id'] | undefined) {
    if (recipe === undefined) {
      this.group.type = 'simple'
      this.group.recipe = undefined
      return this
    }
    this.group.type = 'recipe'
    this.group.recipe = recipe
    return this
  }

  addItem(item: FoodItem) {
    this.group.items.push(item)
    return this
  }

  addItems(items: readonly FoodItem[]) {
    this.group.items.push(...items)
    return this
  }

  findItem(id: FoodItem['id']) {
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

  editItems(
    callback: (
      id: number,
      editor: Omit<ItemEditor, 'finish'> | undefined,
    ) => void,
  ) {
    for (const item of this.group.items) {
      const editor = new ItemEditor(item)
      callback(item.id, editor)
      const newItem = editor.finish()
      const index = this.group.items.findIndex((i) => i.id === item.id)
      this.group.items.splice(index, 1, newItem)
    }
    return this
  }

  setItems(items: FoodItem[]) {
    this.group.items = deepCopy(items) as Array<Mutable<FoodItem>>
    return this
  }

  deleteItem(id: number) {
    const index = this.group.items.findIndex((item) => item.id === id)
    if (index === -1) {
      console.warn(`Item with id ${id} not found!`)
      return this
    }
    this.group.items.splice(index, 1)
    return this
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
