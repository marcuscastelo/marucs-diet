import { DayData } from "@/model/dayModel";
import { Food } from "@/model/foodModel";
import { MealItemData } from "@/model/mealItemModel";
import { MealData } from "@/model/mealModel";

export const mockFood = (partial?: Partial<Food>): Food => ({
    id: Math.random().toString(),
    name: "Papa de carne bovina moída (acém), fubá e couve, c/ caldo de frango, c/ cebola e azeite de oliva, s/ sal",
    tbcaId: "A0105N",
    macros: {
        calories: 100,
        carbs: 100,
        protein: 100,
        fat: 100,
    },
    ...partial,
});

export const mockMeal = (partial?: Partial<MealData>): MealData => ({
    id: Math.random().toString(),
    items: [mockItem(), mockItem(), mockItem()],
    name: 'Café da manhã',
    ...partial,
}) ;

export const mockItem = (partial?: Partial<MealItemData>): MealItemData => ({
    id: Math.random().toString(),
    food: mockFood(),
    quantity: 123,
    ...partial,
});


export const mockDay = (partial: Partial<DayData> & Pick<DayData, 'owner' | 'targetDay'>): DayData => ({
    meals: [
        mockMeal({
            name: `Café da Manhã ${Math.round(Math.random() * 100)}`,
        }),
        mockMeal({
            name: `Almoço ${Math.round(Math.random() * 100)}`,
        }),
        mockMeal({
            name: `Lanche ${Math.round(Math.random() * 100)}`,
        }),
        mockMeal({
            name: `Janta ${Math.round(Math.random() * 100)}`,
        }),
        mockMeal({
            name: `Pós Janta ${Math.round(Math.random() * 100)}`,
        }),
    ],
    ...partial,
});