'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert, Breadcrumb } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { FoodItem } from '@/model/foodItemModel'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { useFavoriteFoods, useUser } from '@/redux/features/userSlice'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import LoadingRing from '@/app/LoadingRing'
import { ModalRef } from '@/app/(modals)/modal'
import RecipeEditModal from '@/app/(recipe)/RecipeEditModal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import { mockFood, mockItem } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { MealData } from '@/model/mealModel'

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal'
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal'
const RECIPE_EDIT_MODAL_ID = 'recipe-edit-modal'

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search

export type FoodSearchProps = {
  targetName: string
  onNewFoodItem: (foodItem: FoodItem) => Promise<void>
  onFinish: () => void
}

export default function FoodSearch({
  targetName,
  onNewFoodItem,
  onFinish,
}: FoodSearchProps) {
  const FOOD_LIMIT = 100
  const TYPE_TIMEOUT = 1000

  const { user } = useUser()

  const [search, setSearch] = useState<string>('')
  const [foods, setFoods] = useState<Loadable<Food[]>>({ loading: true })

  const [selectedFood, setSelectedFood] = useState(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )

  const foodItemEditModalRef = useRef<ModalRef>(null)
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
      foods = await listFoods(10, favoriteFoods)
    } else {
      foods = await searchFoodsByName(search, 10, favoriteFoods)
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user.loading || typing) {
      return
    }

    fetchFoods(search, user.data.favorite_foods)
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

  const handleNewFoodItem = async (item: FoodItem) => {
    await onNewFoodItem(item)
    // Prompt if user wants to add another item or go back (Yes/No)
    const oneMore = confirm(
      'Item adicionado com sucesso. Deseja adicionar outro item?',
    )

    if (!oneMore) {
      onFinish()
    } else {
      setSelectedFood(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
      foodItemEditModalRef.current?.close()
    }
  }

  const mockedRecipe: Recipe = createRecipe({
    name: 'Receita de teste',
    items: [mockItem()],
  })

  return (
    <>
      <BarCode
        barCodeInsertModalRef={barCodeInsertModalRef}
        foodItemEditModalRef={foodItemEditModalRef}
        setSelectedFood={setSelectedFood}
      />
      <FoodItemEditModal
        modalId={MEAL_ITEM_ADD_MODAL_ID}
        ref={foodItemEditModalRef}
        targetName={targetName}
        foodItem={{
          reference: selectedFood.id,
          name: selectedFood.name,
          macros: selectedFood.macros,
        }}
        onApply={async (i) => handleNewFoodItem(i)}
      />
      {/* // TODO: Revisit if RecipeEditModal should be on FoodSearch */}
      {/* <RecipeEditModal
        modalId={RECIPE_EDIT_MODAL_ID}
        ref={recipeEditModalRef}
        recipe={mockedRecipe}
        onSaveRecipe={async () => alert('TODO: Save recipe')}
      /> */}
      <Tabs />
      <SearchBar isDesktop={isDesktop} search={search} setSearch={setSearch} />
      <SearchResults
        search={search}
        filteredFoods={filteredFoods}
        barCodeInsertModalRef={barCodeInsertModalRef}
        foodItemEditModalRef={foodItemEditModalRef}
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
  foodItemEditModalRef,
  setSelectedFood,
}: {
  barCodeInsertModalRef: React.RefObject<ModalRef>
  foodItemEditModalRef: React.RefObject<ModalRef>
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
        foodItemEditModalRef.current?.showModal()
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
  foodItemEditModalRef,
  barCodeInsertModalRef,
}: {
  search: string
  searchingFoods: boolean
  typing: boolean
  filteredFoods: Food[]
  isFoodFavorite: (food: number) => boolean
  setFoodAsFavorite: (food: number, favorite: boolean) => void
  setSelectedFood: (food: Food) => void
  foodItemEditModalRef: React.RefObject<ModalRef>
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
                    name: food.name,
                    quantity: 100,
                    macros: food.macros,
                    reference: food.id,
                  }}
                  className="mt-1"
                  onClick={() => {
                    setSelectedFood(food)
                    foodItemEditModalRef.current?.showModal()
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
