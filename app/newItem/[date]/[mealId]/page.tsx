'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert, Breadcrumb } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import PageLoading from '../../../PageLoading'
import MealItemAddModal from '../../../MealItemAddModal'
import { mockFood, mockItem } from '../../../test/unit/(mock)/mockData'
import { FoodItem } from '@/model/foodItemModel'
import { listDays, updateDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { useFavoriteFoods, useUser } from '@/redux/features/userSlice'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import LoadingRing from '@/app/LoadingRing'
import { useRouter } from 'next/navigation'
import { ModalRef } from '@/app/(modals)/modal'
import RecipeEditModal from '@/app/(modals)/RecipeEditModal'
import { Recipe, createRecipe } from '@/model/recipeModel'

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal'
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal'
const RECIPE_EDIT_MODAL_ID = 'recipe-edit-modal'

type PageProperties = {
  params: {
    date: string
    mealId: string
  }
}

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search
export default function Page({ params }: PageProperties) {
  const router = useRouter()

  const FOOD_LIMIT = 100
  const TYPE_TIMEOUT = 1000

  const dayParam = params.date

  const { user } = useUser()

  const [search, setSearch] = useState<string>('')
  const [foods, setFoods] = useState<Loadable<Food[]>>({ loading: true })
  const [days, setDays] = useState<Loadable<Day[]>>({ loading: true })

  const [selectedFood, setSelectedFood] = useState(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )
  const [quantity, setQuantity] = useState<number>(0) // TODO: Remove managed state of quantity

  const [showingMealItemAddModal, setShowingMealItemAddModal] = useState(false)
  const [showingBarCodeInsertModal, setShowingBarCodeInsertModal] =
    useState(false)
  const [showingRecipeEditModal, setShowingRecipeEditModal] = useState(false)

  const mealItemAddModalRef = useRef<ModalRef>(null)
  const barCodeInsertModalRef = useRef<ModalRef>(null)
  const recipeEditModalRef = useRef<ModalRef>(null)

  const [searchingFoods, setSearchingFoods] = useState(false)

  const [typing, setTyping] = useState(false)

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window

  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop

  const { isFoodFavorite, setFoodAsFavorite } = useFavoriteFoods()

  const fetchFoods = async (search: string | '', favoriteFoods: number[]) => {
    setSearchingFoods(true)
    setFoods({ loading: false, data: [] })

    let foods: Food[] = []
    if (search === /* TODO: Check if equality is a bug */ '') {
      foods = await listFoods(100, favoriteFoods)
    } else {
      foods = await searchFoodsByName(search, 100, favoriteFoods)
    }

    setSearchingFoods(false)

    const isFavorite = (favoriteFoods: number[], food: Food) => {
      return favoriteFoods.includes(food.id)
    }

    // Sort favorites first
    const sortedFoods = foods.sort((a, b) => {
      if (isFavorite(favoriteFoods, a) && !isFavorite(favoriteFoods, b)) {
        return -1 // a comes first
      }

      if (!isFavorite(favoriteFoods, a) && isFavorite(favoriteFoods, b)) {
        return 1 // b comes first
      }

      return 0
    })

    setFoods({
      loading: false,
      data: sortedFoods,
    })
  }

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays({
      loading: false,
      data: days,
    })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user.loading || typing) {
      return
    }

    fetchFoods(search, user.data.favorite_foods)
    fetchDays(user.data.id)
  }, [user, search, typing])

  useEffect(() => {
    setTyping(true)

    const timeout = setTimeout(() => {
      setTyping(false)
    }, TYPE_TIMEOUT)

    return () => {
      clearTimeout(timeout)
    }
  }, [search])

  if (foods.loading) {
    return <PageLoading message="Carregando alimentos" />
  }

  if (days.loading) {
    return <PageLoading message="Carregando dias" />
  }

  const filteredFoods = foods.data
    .filter((food) => {
      if (search === /* TODO: Check if equality is a bug */ '') {
        return true
      }

      // Fuzzy search
      const searchLower = search.toLowerCase()
      const nameLower = food.name.toLowerCase()
      const searchWords = searchLower.split(' ')
      const nameWords = nameLower.split(' ')

      for (const searchWord of searchWords) {
        let found = false
        for (const nameWord of nameWords) {
          if (nameWord.startsWith(searchWord)) {
            found = true
            break
          }
        }

        if (!found) {
          return false
        }
      }

      return true
    })
    .slice(0, FOOD_LIMIT)

  const day = days.data.find(
    (day) => day.target_day === /* TODO: Check if equality is a bug */ dayParam,
  )

  if (!day) {
    return (
      <>
        <TopBar
          dayParam={dayParam}
          mealName={'Erro 404 - Dia não encontrado'}
        />
        <Alert color="red" className="mt-2">
          Dia não encontrado {dayParam}.
        </Alert>
        <div className="bg-gray-800 p-1">
          Dias disponíveis:
          {JSON.stringify(
            days.data.map((d) => d.target_day),
            null,
            2,
          )}
        </div>
      </>
    )
  }

  const meal = day.meals.find(
    (meal) =>
      meal.id.toString() ===
      /* TODO: Check if equality is a bug */ params.mealId,
  )

  if (!meal) {
    return (
      <>
        <Alert color="red" className="mt-2">
          Refeição não encontrada: &apos;{params.mealId}&apos;.
        </Alert>
        <div className="bg-gray-800 p-1">
          Refeições disponíveis para o dia {dayParam}:&nbsp;
          {JSON.stringify(
            day.meals.map((m) => m.id),
            null,
            2,
          )}
        </div>
      </>
    )
  }

  const onNewMealItem = async (mealItem: FoodItem) => {
    await updateDay(day.id, {
      ...day,
      meals: day.meals.map((m) => {
        if (m.id === /* TODO: Check if equality is a bug */ meal.id) {
          return {
            ...m,
            items: [...m.items, mealItem],
          }
        }

        return m
      }),
    })

    // Prompt if user wants to add another item or go back (Yes/No)
    const oneMore = confirm(
      'Item adicionado com sucesso. Deseja adicionar outro item?',
    )

    if (!oneMore) {
      router.push(`/day/${dayParam}`)
    } else {
      setSelectedFood(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
      mealItemAddModalRef.current?.close()
    }
  }

  const mockedRecipe: Recipe = createRecipe({
    name: 'Receita de teste',
    items: [mockItem()],
  })

  return (
    <>
      <TopBar dayParam={dayParam} mealName={meal.name} />
      <BarCode
        barCodeInsertModalRef={barCodeInsertModalRef}
        mealItemAddModalRef={mealItemAddModalRef}
        setSelectedFood={setSelectedFood}
      />
      <MealItemAddModal
        modalId={MEAL_ITEM_ADD_MODAL_ID}
        ref={mealItemAddModalRef}
        meal={meal}
        itemData={{
          food: selectedFood,
        }}
        onApply={async (i) => onNewMealItem(i)}
      />
      <RecipeEditModal
        modalId={RECIPE_EDIT_MODAL_ID}
        ref={recipeEditModalRef}
        recipe={mockedRecipe}
        itemData={{
          food: selectedFood,
        }}
        onApply={async (i) => onNewMealItem(i)}
      />
      <Tabs />
      <SearchBar isDesktop={isDesktop} search={search} setSearch={setSearch} />
      <SearchResults
        search={search}
        filteredFoods={filteredFoods}
        barCodeInsertModalRef={barCodeInsertModalRef}
        mealItemAddModalRef={mealItemAddModalRef}
        searchingFoods={searchingFoods}
        isFoodFavorite={isFoodFavorite}
        setFoodAsFavorite={setFoodAsFavorite}
        setSelectedFood={setSelectedFood}
        typing={typing}
      />
    </>
  )
}

const BarCode = ({
  barCodeInsertModalRef,
  mealItemAddModalRef,
  setSelectedFood,
}: {
  barCodeInsertModalRef: React.RefObject<ModalRef>
  mealItemAddModalRef: React.RefObject<ModalRef>
  setSelectedFood: (food: Food) => void
}) => (
  <>
    <div className="mb-2 flex justify-start">
      <button
        onClick={() => {
          barCodeInsertModalRef.current?.showModal()
        }}
        className="mt-2 rounded bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
      >
        Inserir código de barras
      </button>
    </div>
    <BarCodeInsertModal
      modalId={BAR_CODE_INSERT_MODAL_ID}
      ref={barCodeInsertModalRef}
      onSelect={(food) => {
        setSelectedFood(food)
        mealItemAddModalRef.current?.showModal()
      }}
    />
  </>
)

const Tabs = () => {
  return (
    <>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select your country
        </label>
        <select
          id="tabs"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        >
          <option>Profile</option>
          <option>Canada</option>
          <option>France</option>
          <option>Germany</option>
        </select>
      </div>
      <ul className="hidden divide-x divide-gray-200 rounded-lg text-center text-sm font-medium text-gray-500 shadow dark:divide-gray-700 dark:text-gray-400 sm:flex">
        <li className="w-full">
          <a
            href="#"
            className="active inline-block w-full rounded-l-lg rounded-bl-none bg-gray-100 p-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
            aria-current="page"
          >
            Profile
          </a>
        </li>
        <li className="w-full">
          <a
            href="#"
            className="inline-block w-full bg-white p-4 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Dashboard
          </a>
        </li>
        <li className="w-full">
          <a
            href="#"
            className="inline-block w-full bg-white p-4 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Settings
          </a>
        </li>
        <li className="w-full">
          <a
            href="#"
            className="inline-block w-full rounded-r-lg rounded-br-none bg-white p-4 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Invoice
          </a>
        </li>
      </ul>
    </>
  )
}

const SearchBar = ({
  isDesktop,
  search,
  setSearch,
}: {
  isDesktop: boolean
  search: string
  setSearch: (search: string) => void
}) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <svg
        aria-hidden="true"
        className="h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
    </div>
    <input
      autoFocus={isDesktop}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      type="search"
      id="default-search"
      className="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Buscar alimentos"
      required
    />
  </div>
)

const SearchResults = ({
  search,
  searchingFoods,
  typing,
  filteredFoods,
  isFoodFavorite,
  setFoodAsFavorite,
  setSelectedFood,
  mealItemAddModalRef,
  barCodeInsertModalRef,
}: {
  search: string
  searchingFoods: boolean
  typing: boolean
  filteredFoods: Food[]
  isFoodFavorite: (food: number) => boolean
  setFoodAsFavorite: (food: number, favorite: boolean) => void
  setSelectedFood: (food: Food) => void
  mealItemAddModalRef: React.RefObject<ModalRef>
  barCodeInsertModalRef: React.RefObject<ModalRef>
}) => {
  return (
    <>
      {!searchingFoods &&
        !typing &&
        filteredFoods.length === /* TODO: Check if equality is a bug */ 0 && (
          <Alert color="warning" className="mt-2">
            Nenhum alimento encontrado para a busca &quot;{search}&quot;.
          </Alert>
        )}

      <div className="bg-gray-800 p-1">
        {searchingFoods && filteredFoods.length === 0 ? (
          <PageLoading message="Carregando alimentos" />
        ) : (
          <>
            {filteredFoods.map((food, idx) => (
              <div key={idx}>
                <FoodItemView
                  foodItem={{
                    id: Math.random() * 1000000,
                    food,
                    quantity: 100,
                  }}
                  className="mt-1"
                  onClick={() => {
                    setSelectedFood(food)
                    mealItemAddModalRef.current?.showModal()
                    barCodeInsertModalRef.current?.close()
                  }}
                  header={
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={isFoodFavorite(food.id)}
                          setFavorite={(favorite) =>
                            setFoodAsFavorite(food.id, favorite)
                          }
                        />
                      }
                    />
                  }
                  nutritionalInfo={<FoodItemView.NutritionalInfo />}
                />
              </div>
            ))}
            {searchingFoods && filteredFoods.length > 0 && <LoadingRing />}
          </>
        )}
      </div>
    </>
  )
}

const TopBar = ({
  dayParam,
  mealName,
}: {
  dayParam: string
  mealName: string
}) => (
  <Breadcrumb
    aria-label="Solid background breadcrumb example"
    className="bg-gray-50 px-5 py-3 dark:bg-gray-900"
  >
    <Breadcrumb.Item href="/">
      <p>Home</p>
    </Breadcrumb.Item>
    <Breadcrumb.Item href={`/day/${dayParam}`}>{dayParam}</Breadcrumb.Item>
    <Breadcrumb.Item>{mealName}</Breadcrumb.Item>
    {/* <UserSelector /> */}
  </Breadcrumb>
)
