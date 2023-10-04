import { FoodItem } from '@/model/foodItemModel'
import { Recipe } from '@/model/recipeModel'
import { ItemContainer } from './interfaces/itemContainer'
import { Editor } from './editor'
import { ItemEditor } from './itemEditor'

export class RecipeEditor extends Editor<Recipe> implements ItemContainer {
  private readonly recipe = this.content

  addItem(item: FoodItem) {
    this.recipe.items.push(item)
    return this
  }

  addItems(items: FoodItem[]) {
    this.recipe.items.push(...items)
    return this
  }

  findItem(id: number): FoodItem | undefined {
    return this.recipe.items.find((item) => item.id === id)
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
      const index = this.recipe.items.findIndex((item) => item.id === id)
      this.recipe.items.splice(index, 1, newItem)
    }
    return this
  }

  deleteItem(id: number) {
    const index = this.recipe.items.findIndex((item) => item.id === id)
    if (index === -1) {
      console.warn(`Item with id ${id} not found!`)
      throw new Error(`Item with id ${id} not found!`)
    }
    this.recipe.items.splice(index, 1)
    return this
  }

  clearItems(): void {
    this.recipe.items = []
  }

  // TODO: Move eslint-disable-next-line to eslint config
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected beforeFinish(): void {}
  // TODO: Move eslint-disable-next-line to eslint config
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected afterFinish(): void {}
}
