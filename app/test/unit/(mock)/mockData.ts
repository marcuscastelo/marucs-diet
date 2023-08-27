import { Day } from '@/model/dayModel'
import { Food } from '@/model/foodModel'
import { FoodItem } from '@/model/foodItemModel'
import { Meal, createMeal } from '@/model/mealModel'
import { New } from '@/utils/newDbRecord'
import { Recipe, createRecipe } from '@/model/recipeModel'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/foodItemGroupModel'

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

export const mockSimpleGroup = (
  partial?: Partial<SimpleItemGroup>,
): ItemGroup =>
  ({
    id: Math.round(Math.random() * 1000),
    name: 'Grupo 1',
    quantity: 100,
    type: 'simple',
    items: [mockItem(), mockItem(), mockItem()],
    ...partial,
  }) satisfies ItemGroup

export const mockRecipedGroup = (
  partial?: Partial<RecipedItemGroup>,
): ItemGroup =>
  ({
    id: Math.round(Math.random() * 1000),
    name: 'Grupo 1 (receita)',
    quantity: 100,
    type: 'recipe',
    recipe: 2,
    items: [mockItem(), mockItem(), mockItem()],
    ...partial,
  }) satisfies ItemGroup

export const mockMeal = (partial?: Partial<New<Meal>>): Meal =>
  createMeal({
    groups: [
      mockSimpleGroup({
        name: 'Grupo 1',
      }),
      mockSimpleGroup({
        name: 'Grupo 2',
      }),
      mockSimpleGroup({
        name: 'Grupo 3',
      }),
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
