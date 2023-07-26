'use client';

import { useEffect, useState } from "react";
import DayMeals from "../../DayMeals";
import { DayData } from "@/model/dayModel";
import Meal, { MealProps } from "../../(meal)/Meal";
import PageLoading from "../../PageLoading";
import { createDay, deleteDay, listDays, updateDay } from "@/controllers/days";
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
import UserSelector from "@/app/UserSelector";
import { useUser } from "@/redux/features/userSlice";
import { Loadable } from "@/utils/loadable";
import { getToday, stringToDate } from "@/utils/dateUtils";

export default function Page(context: any) {
    const router = useRouter();

    const currentUser = useUser();

    const [days, setDays] = useState<Loadable<(DayData & Record)[]>>({ loading: true });
    const selectedDay = context.params.day as string; // TODO: type-safe this

    const [selectedMeal, setSelectedMeal] = useState(mockMeal({ name: 'BUG: selectedMeal not set' }));
    const [selectedMealItem, setSelectedMealItem] = useState(mockItem({ quantity: 666 }));

    const editModalId = 'edit-modal';

    const fetchDays = async (userId: string) => {
        const days = await listDays(userId);
        setDays({
            loading: false,
            data: days
        });
    }

    const handleDayChange = (newValue: DateValueType) => {
        if (!newValue?.startDate) {
            router.push('/day');
            return;
        }

        const dateString = newValue.startDate;
        const date = stringToDate(dateString)
        const dayString = date.toISOString().split('T')[0]; //TODO: use dateUtils when this is understood
        router.push(`/day/${dayString}`);
    }

    useEffect(() => {
        if (currentUser.loading) {
            return;
        }

        fetchDays(currentUser.data.id);
    }, [currentUser]);


    if (currentUser.loading) {
        return <PageLoading message="Carregando usuário" />
    }

    if (days.loading) {
        return <PageLoading message="Carregando dias" />
    }

    const hasData = days.data.some((day) => day.targetDay === selectedDay);
    const dayData = days.data.find((day) => day.targetDay === selectedDay);

    const onEditMealItem = (meal: MealData, mealItem: MealItemData) => {
        setSelectedMeal(meal);
        setSelectedMealItem(mealItem);
        showModal(window, editModalId);
    };

    const onUpdateMeal = async (dayData: DayData, meal: MealData) => {
        await updateDay(dayData.id!, { //TODO: remove !
            ...dayData,
            meals: dayData.meals.map((m) => {
                if (m.id !== meal.id) {
                    return m;
                }

                return meal;
            })
        });

        await fetchDays(currentUser.data.id);
    }

    const handleNewItemButton = (meal: MealData) => {
        router.push(`/newItem/${selectedDay}/${meal.id}`);
    }

    const mealProps = dayData?.meals.map((meal): MealProps => ({
        mealData: meal,
        header: <Meal.Header onUpdateMeal={(meal) => onUpdateMeal(dayData, meal)} />,
        content: <Meal.Content onEditItem={(item) => onEditMealItem(meal, item)} />,
        actions: <Meal.Actions onNewItem={() => handleNewItemButton(meal)} />,
    }));

    const mealItemMacros = (mealItem: MealItemData): MacroNutrientsData => {
        const macros = mealItem.food.macros;
        return {
            carbs: macros.carbs * mealItem.quantity / 100,
            protein: macros.protein * mealItem.quantity / 100,
            fat: macros.fat * mealItem.quantity / 100,
        };
    };

    const mealMacros = (meal: MealData): MacroNutrientsData => {
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
        });
    }

    const dayMacros = dayData?.meals.reduce((acc, meal): MacroNutrientsData=> {
        const mm = mealMacros(meal);
        acc.carbs += mm.carbs;
        acc.protein += mm.protein;
        acc.fat += mm.fat;
        return acc;
    }, {
        carbs: 0,
        protein: 0,
        fat: 0,
    });

    function CopyLastDayButton() {
        //TODO: improve this code
        if (days.loading || currentUser.loading) return <>LOADING</>

        const lastDayIdx = days.data.findLastIndex((day) => Date.parse(day.targetDay) < Date.parse(selectedDay));
        if (lastDayIdx === -1) {
            return (
                <button
                    className="btn btn-error text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                    onClick={() => alert(`Não foi possível encontrar um dia anterior a ${selectedDay}`)}
                >
                    Copiar dia anterior: não encontrado!
                </button>
            )
            return;
        }

        return <button
            className="btn btn-primary text-white font-bold py-2 px-4 min-w-full rounded mt-3"
            onClick={async () => {
                if (hasData) {
                    if (confirm('Tem certeza que deseja excluir este dia e copiar o dia anterior?')) {
                        await deleteDay(dayData!.id);
                    }
                }

                const lastDayIdx = days.data.findLastIndex((day) => Date.parse(day.targetDay) < Date.parse(selectedDay));
                if (lastDayIdx === -1) {
                    alert('Não foi possível encontrar um dia anterior');
                    return;
                }

                createDay({
                    ...days.data[lastDayIdx],
                    id: undefined,
                    targetDay: selectedDay,
                }).then(() => {
                    fetchDays(currentUser.data.id);
                });
            }}
        >
            {/* //TODO: copiar qualquer dia */}
            Copiar dia anterior ({days.data[lastDayIdx].targetDay})
        </button>
    }


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
                    <UserSelector />
                </div>
            </div>

            <Show when={!selectedDay}>
                <Alert className="mt-2" color="warning">Selecione um dia</Alert>
            </Show>

            <Show when={!!selectedDay && !hasData}>
                <Alert className="mt-2" color="warning">Nenhum dado encontrado para o dia {selectedDay}</Alert>
                <button
                    className="btn btn-primary text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                    onClick={() => {
                        createDay(mockDay({ owner: currentUser.data.id, targetDay: selectedDay }, { items: [] })).then(() => {
                            fetchDays(currentUser.data.id);
                        });
                    }}
                >
                    Criar dia do zero
                </button>
                <CopyLastDayButton />

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

                                items[changePos] = item;

                                return {
                                    ...meal,
                                    items,
                                };
                            })
                        });

                        await fetchDays(currentUser.data.id);

                        hideModal(window, editModalId);
                    }}
                    onDelete={async (id: string) => {
                        await updateDay(dayData!.id, {
                            ...dayData!,
                            meals: dayData!.meals.map((meal) => {
                                if (meal.id !== selectedMeal.id) {
                                    return meal;
                                }

                                const items = meal.items;
                                const changePos = items.findIndex((i) => i.id === id);

                                items.splice(changePos, 1);

                                return {
                                    ...meal,
                                    items,
                                };
                            })
                        });

                        await fetchDays(currentUser.data.id);

                        hideModal(window, editModalId);
                    }}
                />

                <DayMacros className="mt-3 border-b-2 border-gray-800 pb-4"
                    macros={dayMacros!}
                />
                <DayMeals className="mt-5" mealsProps={mealProps!} />
                <CopyLastDayButton />
                <button
                    className="hover:bg-red-400 text-white font-bold py-2 px-4 min-w-full rounded mt-3 btn btn-error"
                    onClick={() => {
                        createDay(mockDay({ owner: currentUser.data.id, targetDay: selectedDay }, { items: [] })).then(() => {
                            fetchDays(currentUser.data.id);
                        });
                    }}
                >
                    PERIGO: Excluir dia
                </button>
            </Show>

        </div>
    );
}

