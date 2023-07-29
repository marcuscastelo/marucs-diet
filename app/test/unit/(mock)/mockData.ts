import { DayData } from "@/model/dayModel";
import { Food } from "@/model/foodModel";
import { MealItemData } from "@/model/mealItemModel";
import { MealData } from "@/model/mealModel";

export const mockFood = (partial?: Partial<Food>): Food => ({
    id: Math.round(Math.random() * 1000),
    name: "Papa de carne bovina moída (acém), fubá e couve, c/ caldo de frango, c/ cebola e azeite de oliva, s/ sal",
    macros: {
        calories: 100,
        carbs: 100,
        protein: 100,
        fat: 100,
    },
    ...partial,
});

export const mockMeal = (partial?: Partial<MealData>): MealData => ({
    id: Math.round(Math.random() * 1000).toString(),
    items: [mockItem(), mockItem(), mockItem()],
    name: 'Café da manhã',
    ...partial,
}) ;

let mockItemQtyPseudoId = 10;
export const mockItem = (partial?: Partial<MealItemData>): MealItemData => ({
    id: Math.round(Math.random() * 1000).toString(),
    food: mockFood(),
    quantity: (mockItemQtyPseudoId++),
    ...partial,
});


export const mockDay = (partial: Partial<DayData> & Pick<DayData, 'owner' | 'targetDay'>, mealData ?: Partial<MealData>): DayData => ({
    id: Math.round(Math.random() * 1000).toString(),
    meals: [
        mockMeal({
            name: `Café da Manhã`,
            ...mealData
        }),
        mockMeal({
            name: `Almoço`,
            ...mealData
        }),
        mockMeal({
            name: `Lanche`,
            ...mealData
        }),
        mockMeal({
            name: `Janta`,
            ...mealData
        }),
        mockMeal({
            name: `Pós Janta`,
            ...mealData
        }),
    ],
    ...partial,
});