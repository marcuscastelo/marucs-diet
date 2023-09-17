import { FoodItem } from '@/model/foodItemModel'
import { Recipe } from '@/model/recipeModel'
import { deepCopy } from '../deepCopy'

export class RecipeEditor {
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

  addInnerItems(items: FoodItem[]) {
    this.recipe.items.push(...items)
    return this
  }

  finish() {
    const copy = deepCopy(this.recipe)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    return copy
  }
}
