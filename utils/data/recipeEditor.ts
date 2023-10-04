import { FoodItem } from '@/model/foodItemModel'
import { Recipe } from '@/model/recipeModel'
import { deepCopy } from '../deepCopy'
import { ItemContainer } from './itemContainer'

export class RecipeEditor implements ItemContainer {
  private readonly recipe: Recipe
  constructor(recipe: Recipe) {
    const copy = deepCopy(recipe)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    this.recipe = copy
  }

  addItem(item: FoodItem) {
    this.recipe.items.push(item)
    return this
  }

  addItems(items: FoodItem[]) {
    this.recipe.items.push(...items)
    return this
  }

  clearItems(): void {
    this.recipe.items = []
  }

  finish() {
    const copy = deepCopy(this.recipe)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    return copy
  }
}
