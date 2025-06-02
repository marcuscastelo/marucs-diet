import { Editor } from '~/legacy/utils/data/editor'
import { MealEditor } from '~/legacy/utils/data/mealEditor'
import { deepCopy } from '~/legacy/utils/deepCopy'
import { type Mutable } from '~/legacy/utils/typeUtils'
import { NewDayDiet, type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type Meal } from '~/modules/diet/meal/domain/meal'

export class DayDietEditor extends Editor<DayDiet, NewDayDiet> {
  private readonly dayDiet = this.content

  addMeal(meal: Meal) {
    this.dayDiet.meals.push(deepCopy(meal) as Mutable<Meal>)
    return this
  }

  addMeals(meals: readonly Meal[]) {
    this.dayDiet.meals.push(...(meals.map(deepCopy) as Array<Mutable<Meal>>))
    return this
  }

  findMeal(id: Meal['id']) {
    return this.dayDiet.meals.find((item) => item.id === id)
  }

  editMeal(
    id: Meal['id'],
    callback: (editor: Omit<MealEditor, 'finish'> | undefined) => void,
  ) {
    const meal = this.findMeal(id)
    const editor = meal !== undefined ? new MealEditor(meal) : undefined
    callback(editor)
    const newItem = editor?.finish()
    if (newItem !== undefined) {
      const index = this.dayDiet.meals.findIndex((meal) => meal.id === id)
      this.dayDiet.meals.splice(index, 1, newItem)
    }
    return this
  }

  // editItems (
  //   callback: (
  //     id: number,
  //     editor: Omit<ItemEditor, 'finish'> | undefined,
  //   ) => void
  // ) {
  //   for (const item of this.meal.groups) {
  //     const editor = new ItemEditor(item)
  //     callback(item.id, editor)
  //     const newItem = editor.finish()
  //     const index = this.meal.groups.findIndex((i) => i.id === item.id)
  //     this.meal.groups.splice(index, 1, newItem)
  //   }
  //   return this
  // }

  setMeals(meals: Meal[]) {
    this.dayDiet.meals = deepCopy(meals) as Array<Mutable<Meal>>
    return this
  }

  deleteMeal(id: Meal['id']) {
    const index = this.dayDiet.meals.findIndex((meal) => meal.id === id)
    if (index === -1) {
      console.warn(`Item with id ${id} not found!`)
      return this
    }
    this.dayDiet.meals.splice(index, 1)
    return this
  }

  clearMeals() {
    this.dayDiet.meals = []
    return this
  }

  protected override onFinish() {

  }
}

/**
 * @deprecated Not used. TODO: Clean up dayDiet repository.
 */
