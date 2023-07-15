'use client';

import { useEffect, useState } from "react";
import DayMeals from "../../DayMeals";
import { DayData } from "@/model/dayModel";
import { MealProps } from "../../Meal";
import { listFoods } from "@/controllers/food";
import { FoodData } from "@/model/foodModel";
import PageLoading from "../../PageLoading";
import { createDay, listDays, updateDay } from "@/controllers/days";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import Datepicker from "react-tailwindcss-datepicker";
import { Alert } from "flowbite-react";
import Show from "../../Show";
import DayMacros from "../../DayMacros";
import { MealData } from "@/model/mealModel";
import { MealItemData } from "@/model/mealItemModel";
import { MacroNutrientsData } from "@/model/macroNutrientsModel";
import { useRouter } from "next/navigation";
import MealItemAddModal from "@/app/MealItemAddModal";
import { mockDay, mockFood, mockItem, mockMeal } from "@/app/test/unit/(mock)/mockData";
import { Record } from "pocketbase";
import { hideModal, showModal } from "@/utils/DOMModal";

export default function Page(context: any) {
    const router = useRouter();

    const [foods, setFoods] = useState([] as (FoodData & Record)[]);
    const [days, setDays] = useState([] as (DayData & Record)[]);
    const selectedDay = context.params.day as string;

    const [selectedMeal, setSelectedMeal] = useState(mockMeal({ name: 'BUG: selectedMeal not set' }));
    const [selectedMealItem, setSelectedMealItem] = useState(mockItem({ quantity: 666 }));

    const editModalId = 'edit-modal';

    const fetchFoods = async () => {
        const foods = await listFoods();
        setFoods(foods);
    }

    const fetchDays = async () => {
        const days = await listDays();
        setDays(days);
    }

    const handleDayChange = (newValue: DateValueType) => {
        if (!newValue?.startDate) {
            router.push('/day');
            return;
        }

        const dateString = newValue?.startDate;
        const date = new Date(`${dateString}T00:00:00`);
        const dayString = date.toISOString().split('T')[0];
        router.push(`/day/${dayString}`);
    }

    useEffect(() => {
        fetchFoods();
        fetchDays();
    }, []);

    const loading = days.length == 0 || foods.length == 0;

    if (loading) {
        return <PageLoading message="Carregando dias e alimentos" />
    }

    const hasData = days.some((day) => day.targetDay === selectedDay);
    const dayData = days.find((day) => day.targetDay === selectedDay);

    const mealProps = dayData?.meals.map((meal) => {
        const mealProps: MealProps = {
            mealData: meal,
            onEditItem: (mealItem) => {
                setSelectedMeal(meal);
                setSelectedMealItem(mealItem);
                showModal(window, editModalId);
            },
            onNewItem: () => {
                // Redirect to new item page
                window.location.href = `/newItem/${selectedDay}/${meal.id}`;
            }
        };
        return mealProps;
    });

    const foodMacros = (food: FoodData) => ({
        carbs: parseFloat(food.components['Carboidrato total']?.[0] ?? ''),
        protein: parseFloat(food.components['Proteína']?.[0] ?? ''),
        fat: parseFloat(food.components['Lipídios']?.[0] ?? ''),

    } as MacroNutrientsData);

    const mealItemMacros = (mealItem: MealItemData) => {
        const fm = foodMacros(mealItem.food);
        return {
            carbs: fm.carbs * mealItem.quantity / 100,
            protein: fm.protein * mealItem.quantity / 100,
            fat: fm.fat * mealItem.quantity / 100,
        } as MacroNutrientsData;
    };

    const mealMacros = (meal: MealData) => {
        return meal.items.reduce((acc, item) => {
            const itemMacros = mealItemMacros(item);
            acc.carbs += itemMacros.carbs;
            acc.protein += itemMacros.protein;
            acc.fat += itemMacros.fat;
            return acc;
        }, {
            carbs: 0,
            protein: 0,
            fat: 0,
        } as MacroNutrientsData);
    }

    const dayMacros = dayData?.meals.reduce((acc, meal) => {
        const mm = mealMacros(meal);
        acc.carbs += mm.carbs;
        acc.protein += mm.protein;
        acc.fat += mm.fat;
        return acc;
    }, {
        carbs: 0,
        protein: 0,
        fat: 0,
    } as MacroNutrientsData);

    return (
        <div className="sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3 mx-auto">
            {/* Top bar with date picker and user icon */}
            <div className="bg-slate-900 py-2 flex justify-between items-center gap-4 px-4">
                <div className="flex-1">
                    <Datepicker
                        asSingle={true}
                        useRange={false}
                        readOnly={true}
                        value={{
                            startDate: selectedDay,
                            endDate: selectedDay,
                        }}
                        onChange={handleDayChange}
                    />
                </div>

                {/* User icon */}
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-white">Marcus</div>
                            <div className="text-sm font-medium leading-none text-slate-300">
                                Sair
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Show when={!selectedDay}>
                <Alert className="mt-2" color="warning">Selecione um dia</Alert>
            </Show>

            <Show when={!!selectedDay && !hasData}>
                <Alert className="mt-2" color="warning">Nenhum dado encontrado para o dia {selectedDay}</Alert>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                    onClick={() => {
                        createDay(mockDay({ targetDay: selectedDay })).then(() => {
                            fetchDays();
                        });
                    }}
                >
                    Criar dia
                </button>
            </Show>

            <Show when={!!selectedDay && hasData && !dayData}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados {selectedDay}</Alert>;
            </Show>

            <Show when={!!selectedDay && hasData && !!dayData && !mealProps}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados de refeições {selectedDay}</Alert>;
            </Show>

            <Show when={!!selectedDay && hasData && !!dayData && !!mealProps && !dayMacros}>
                <Alert className="mt-2" color="warning">Dia encontrado, mas sem dados de macros {selectedDay}</Alert>;
            </Show>

            <Show when={hasData}>

                <MealItemAddModal
                    modalId={editModalId}
                    itemData={{
                        id: selectedMealItem.id,
                        food: selectedMealItem.food,
                        quantity: selectedMealItem.quantity,
                    }}
                    meal={selectedMeal}
                    show={false}
                    onApply={async (item) => {
                        await updateDay(dayData!.id, {
                            ...dayData!,
                            meals: dayData!.meals.map((meal) => {
                                if (meal.id !== selectedMeal.id) {
                                    return meal;
                                }

                                const items = meal.items;
                                const changePos = items.findIndex((i) => i.id === item.id);

                                if (item.quantity === 666) {
                                    alert('HACK: remove item with quantity 666');
                                    items.splice(changePos, 1);
                                } else {
                                    items[changePos] = item;
                                }

                                return {
                                    ...meal,
                                    items,
                                };
                            })
                        });

                        await fetchDays();

                        hideModal(window, editModalId);
                    }}
                />

                <DayMacros className="mt-3 border-b-2 border-gray-800 pb-4"
                    macros={dayMacros!}
                />
                <DayMeals className="mt-5" mealsProps={mealProps!} />
            </Show>
        </div>
    );
}