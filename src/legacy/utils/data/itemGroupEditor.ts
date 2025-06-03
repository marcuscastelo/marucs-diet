import { type Item } from '~/modules/diet/item/domain/item'
import { type ItemContainer } from '~/legacy/utils/data/interfaces/itemContainer'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { Editor } from '~/legacy/utils/data/editor'
import { ItemEditor } from '~/legacy/utils/data/itemEditor'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { deepCopy } from '~/legacy/utils/deepCopy'
import { type Mutable } from '~/legacy/utils/typeUtils'

// TODO: Remove deprecated ItemGroupEditor - Replace with pure functions in item-group/application/
/**
 * @deprecated Use pure functions instead of ItemGroupEditor pattern.
 * Replace with functions like: addItemToGroup(group, item), updateGroupRecipe(group, recipeId)
 * See CODESTYLE_GUIDE.md section #3 for replacement patterns.
 */
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

  addItem(item: Item) {
    this.group.items.push(item)
    return this
  }

  addItems(items: readonly Item[]) {
    this.group.items.push(...items)
    return this
  }

  findItem(id: Item['id']) {
    return this.group.items.find((item) => item.id === id)
  }

  editItem(
    id: number,
    callback: (editor: Omit<ItemEditor, 'finish'> | undefined) => void,
  ) {
    const item = this.findItem(id)
    const editor =
      item !== undefined && item !== null ? new ItemEditor(item) : undefined
    callback(editor)
    const newItem = editor?.finish()
    if (newItem !== undefined) {
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

  setItems(items: Item[]) {
    this.group.items = deepCopy(items) as Array<Mutable<Item>>
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

  protected override onFinish() {}
}
