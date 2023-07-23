'use client';

import MealItem from "@/app/MealItem";
import { listFoods, searchFoods } from "@/controllers/food";
import { Food } from "@/model/foodModel";
import { Alert, Breadcrumb } from "flowbite-react";
import { useEffect, useState } from "react";
import PageLoading from "../../../PageLoading";
import MealItemAddModal from "../../../MealItemAddModal";
import { mockFood, mockMeal } from "../../../test/unit/(mock)/mockData";
import { MealItemData } from "@/model/mealItemModel";
import { listDays, updateDay } from "@/controllers/days";
import { DayData } from "@/model/dayModel";
import { Record } from "pocketbase";
import BarCodeInsertModal from "@/app/BarCodeInsertModal";
import { showModal } from "@/utils/DOMModal";
import { setUserJson, useUser } from "@/redux/features/userSlice";
import { User } from "@/model/userModel";
import { Loadable } from "@/utils/loadable";
import { updateUser } from "@/controllers/users";
import { useAppDispatch } from "@/redux/hooks";
import UserSelector from "@/app/UserSelector";

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal';
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal';

export default function Page(context: any) {
    const FOOD_LIMIT = 100;
    const dayParam = context.params.date as string;

    const dispatch = useAppDispatch();
    const currentUser = useUser();

    const [search, setSearch] = useState<string>('');
    const [foods, setFoods] = useState<Loadable<(Food)[]>>({ loading: true });
    const [days, setDays] = useState<Loadable<(DayData & Record)[]>>({ loading: true });
    const [selectedFood, setSelectedFood] = useState(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }));

    const [isClient, setIsClient] = useState(false)

    const isDesktop = isClient ? window.innerWidth > 768 : false;

    const isFavorite = (favoriteFoods: string[], food: Food) => {
        return favoriteFoods.includes(food.id);
    }

    const fetchFoods = async (search: string | '', favoriteFoods: string[]) => {
        let foods: Food[] = [];
        if (search == '') {
            foods = await listFoods(); // TODO: add limit when search is made on backend
        } else {
            foods = await searchFoods(search); // TODO: add limit when search is made on backend
        }

        const isFavorite = (favoriteFoods: string[], food: Food) => {
            return favoriteFoods.includes(food.id);
        }

        // Sort favorites first
        const sortedFoods = foods.sort((a, b) => {
            if (isFavorite(favoriteFoods, a) && !isFavorite(favoriteFoods, b)) {
                return -1; // a comes first
            }

            if (!isFavorite(favoriteFoods, a) && isFavorite(favoriteFoods, b)) {
                return 1; // b comes first
            }

            return 0;
        });

        setFoods({
            loading: false,
            data: sortedFoods
        });
    }

    const fetchDays = async (userId: string) => {
        const days = await listDays(userId);
        setDays({
            loading: false,
            data: days
        });
    }

    const onUserFavoritesChanged = async (user: User) => {
        const updatedUser = await updateUser(user.id, user);
        dispatch(setUserJson(JSON.stringify(updatedUser)));
    }

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (currentUser.loading) {
            return;
        }

        fetchFoods(search, currentUser.data.favoriteFoods);
        fetchDays(currentUser.data.id);
    }, [currentUser, search]);

    if (foods.loading) {
        return <PageLoading message="Carregando alimentos" />
    }

    if (days.loading) {
        return <PageLoading message="Carregando dias" />
    }

    const filteredFoods = foods.data.filter(
        (food) => {
            if (search == "") {
                return true;
            }

            // Fuzzy search
            const searchLower = search.toLowerCase();
            const nameLower = food.name.toLowerCase();
            const searchWords = searchLower.split(" ");
            const nameWords = nameLower.split(" ");

            for (const searchWord of searchWords) {
                let found = false;
                for (const nameWord of nameWords) {
                    if (nameWord.startsWith(searchWord)) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return false;
                }
            }

            return true;
        }
    ).slice(0, FOOD_LIMIT);

    const day = days.data.find((day) => day.targetDay == dayParam);

    if (!day) {
        return <>
            <TopBar dayParam={dayParam} mealName={"Erro 404 - Dia não encontrado"} />
            <Alert color="red" className="mt-2">Dia não encontrado {dayParam}.</Alert>
            <div className="bg-gray-800 p-1">
                Dias disponíveis:
                {JSON.stringify(days.data.map(d => d.targetDay), null, 2)}
            </div>
        </>
    }

    const meal = day.meals.find((meal) => meal.id == context.params.mealId);

    if (!meal) {
        return <>
            <Alert color="red" className="mt-2">Refeição não encontrada {context.params.mealId}.</Alert>
            <div className="bg-gray-800 p-1">
                Refeições disponíveis para o dia {dayParam}:&nbsp;
                {JSON.stringify(day.meals.map(m => m.id), null, 2)}
            </div>
        </>
    }

    const onNewMealItem = async (mealItem: MealItemData) => {
        await updateDay(day.id, {
            ...day,
            meals: day.meals.map((m) => {
                if (m.id == meal.id) {
                    return {
                        ...m,
                        items: [...m.items, mealItem]
                    }
                }

                return m;
            })
        });
        window.location.href = `/`;
    }

    return (
        <>
            <TopBar dayParam={dayParam} mealName={meal.name} />

            <div className="flex justify-start mb-2">
                <button
                    onClick={() => {
                        showModal(window, BAR_CODE_INSERT_MODAL_ID);
                    }}
                    className="mt-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Inserir código de barras
                </button>
            </div>

            <BarCodeInsertModal
                modalId={BAR_CODE_INSERT_MODAL_ID} onSelect={
                    (food) => {
                        setSelectedFood(food);
                        showModal(window, MEAL_ITEM_ADD_MODAL_ID);
                    }
                } />

            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input autoFocus={isDesktop} value={search} onChange={(e) => setSearch(e.target.value)} type="search" id="default-search" className="block w-full p-4 pl-10 text-sm bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Buscar alimentos" required />
            </div>

            {filteredFoods.length == 0 && <Alert color="warning" className="mt-2">Nenhum alimento encontrado para a busca &quot;{search}&quot;.</Alert>}

            <MealItemAddModal modalId={MEAL_ITEM_ADD_MODAL_ID} meal={meal} itemData={{
                food: selectedFood,
            }}
                onApply={async (i) => onNewMealItem(i)}
            />

            <div className="bg-gray-800 p-1">
                {
                    filteredFoods.map((food, idx) =>
                        <div key={idx}>
                            <MealItem
                                mealItem={{
                                    id: Math.random().toString(),
                                    food: food,
                                    quantity: 100,
                                }}
                                className="mt-1"
                                key={idx}
                                onClick={() => {
                                    setSelectedFood(food);
                                    showModal(window, MEAL_ITEM_ADD_MODAL_ID)
                                }}
                                favorite={
                                    currentUser.loading ? false :
                                        isFavorite(currentUser.data.favoriteFoods, food)
                                }
                                setFavorite={(favorite) => {
                                    if (currentUser.loading) {
                                        return;
                                    }

                                    const newUser = Object.assign({}, currentUser.data);

                                    newUser.favoriteFoods = [...currentUser.data.favoriteFoods]

                                    if (favorite) {
                                        newUser.favoriteFoods.push(food.id);
                                    } else {
                                        newUser.favoriteFoods = newUser.favoriteFoods.filter((f) => f != food.id);
                                    }

                                    onUserFavoritesChanged(newUser);
                                }}
                            />
                        </div>
                    )
                }
            </div>
        </>
    );
}

const TopBar = ({dayParam, mealName}: {dayParam: string, mealName: string}) =>             
    <Breadcrumb
    aria-label="Solid background breadcrumb example"
    className="bg-gray-50 px-5 py-3 dark:bg-gray-900"
    >
    <Breadcrumb.Item
        href="/"
    >
        <p>
            Home
        </p>
    </Breadcrumb.Item>
    <Breadcrumb.Item href="#">
        {dayParam}
    </Breadcrumb.Item>
    <Breadcrumb.Item>
        {mealName}
    </Breadcrumb.Item>
    <UserSelector />
    </Breadcrumb>