import { Day } from '@/model/dayModel'
import { Food } from '@/model/foodModel'
import { FoodItem } from '@/model/foodItemModel'
import { MealData, createMeal } from '@/model/mealModel'
import { New } from '@/utils/newDbRecord'
import { Recipe, createRecipe } from '@/model/recipeModel'

export const mockFood = (partial?: Partial<Food>): Food => ({
  id: Math.round(Math.random() * 1000),
  name: 'Papa de carne bovina moída (acém), fubá e couve, c/ caldo de frango, c/ cebola e azeite de oliva, s/ sal',
  macros: {
    carbs: 100,
    protein: 100,
    fat: 100,
  },
  ...partial,
})

export const mockMeal = (partial?: Partial<New<MealData>>): MealData =>
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
  } satisfies New<MealData>)

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
  mealData?: Partial<MealData>,
): Day => ({
  id: Math.round(Math.random() * 1000),
  meals: [
    mockMeal({
      name: `Café da Manhã`,
      ...mealData,
    }),
    mockMeal({
      name: `Almoço`,
      ...mealData,
    }),
    mockMeal({
      name: `Lanche`,
      ...mealData,
    }),
    mockMeal({
      name: `Janta`,
      ...mealData,
    }),
    mockMeal({
      name: `Pós Janta`,
      ...mealData,
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
