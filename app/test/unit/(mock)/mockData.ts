import { Day } from '@/model/dayModel'
import { Food } from '@/model/foodModel'
import { FoodItem } from '@/model/foodItemModel'
import { Meal, createMeal } from '@/model/mealModel'
import { New } from '@/utils/newDbRecord'
import { Recipe, createRecipe } from '@/model/recipeModel'

export const mockFood = (partial?: Partial<Food>): Food => ({
  '': 'Food',
  id: Math.round(Math.random() * 1000),
  name: 'Mocked food',
  macros: {
    carbs: 100,
    protein: 100,
    fat: 100,
  },
  ...partial,
})

export const mockMeal = (partial?: Partial<New<Meal>>): Meal =>
  createMeal({
    groups: [
      {
        id: Math.round(Math.random() * 1000),
        name: 'Grupo 1',
        quantity: 100,
        type: 'simple',
        items: [mockItem(), mockItem(), mockItem()],
      },
    ],
    name: 'Café da manhã',
    ...partial,
  } satisfies New<Meal>)

let mockItemQtyPseudoId = 10
export const mockItem = (partial?: Partial<FoodItem>): FoodItem => ({
  id: Math.round(Math.random() * 10000),
  name: mockFood().name,
  reference: mockFood().id,
  macros: mockFood().macros,
  quantity: mockItemQtyPseudoId++,
  ...partial,
})

export const mockDay = (
  partial: Partial<Day> & Pick<Day, 'owner' | 'target_day'>,
  meal?: Partial<Meal>,
): Day => ({
  id: Math.round(Math.random() * 1000),
  meals: [
    mockMeal({
      name: `Café da Manhã`,
      ...meal,
    }),
    mockMeal({
      name: `Almoço`,
      ...meal,
    }),
    mockMeal({
      name: `Lanche`,
      ...meal,
    }),
    mockMeal({
      name: `Janta`,
      ...meal,
    }),
    mockMeal({
      name: `Pós Janta`,
      ...meal,
    }),
  ],
  ...partial,
})

export const mockRecipe = (partial?: Partial<Recipe>): Recipe =>
  createRecipe({
    name: 'Receita de teste',
    items: [mockItem()],
    ...partial,
  })
