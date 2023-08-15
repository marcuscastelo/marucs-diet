'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { FoodItem } from '@/model/foodItemModel'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import LoadingRing from '@/app/LoadingRing'
import { ModalRef } from '@/app/(modals)/Modal'
import { Recipe } from '@/model/recipeModel'
import { mockFood } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider } from '../(modals)/ModalContext'
import { listRecipes, searchRecipeById } from '@/controllers/recipes'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/foodItemGroupModel'

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal'
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal'

// TODO: Remove all RecipeEditModal references from FoodSearch component
const RECIPE_EDIT_MODAL_ID = 'recipe-edit-modal'

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search

export type FoodSearchProps = {
  targetName: string
  onNewItemGroup: (foodItem: ItemGroup) => Promise<void>
  onFinish: () => void
}

export type Template = Food | Recipe

// TODO: Rename to TemplateSearch?
export default function FoodSearch({
  targetName,
  onNewItemGroup,
  onFinish,
}: FoodSearchProps) {
  const FOOD_LIMIT = 100
  const TYPE_TIMEOUT = 1000

  const { user, isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const [search, setSearch] = useState<string>('')
  // TODO: rename all consumables to templates
  const [consumables, setConsumables] = useState<Loadable<Template[]>>({
    loading: true,
  })

  const [selectedConsumable, setSelectedConsumable] = useState<Template>(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )

  const foodItemEditModalRef = useRef<ModalRef>(null)
  const barCodeInsertModalRef = useRef<ModalRef>(null)
  const recipeEditModalRef = useRef<ModalRef>(null)

  const [searching, setSearching] = useState(false)

  const [typing, setTyping] = useState(false)

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window

  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop

  const fetchConsumables = async (
    search: string | '',
    favoriteConsumables: number[], // TODO: Implement favorite recipes
    userId: User['id'],
  ) => {
    setSearching(true)
    setConsumables({ loading: false, errored: false, data: [] })

    let foods: Food[] = []
    if (search === '') {
      foods = await listFoods(10, favoriteConsumables)
    } else {
      foods = await searchFoodsByName(search, 10, favoriteConsumables)
    }

    const isFavorite = (favoriteFoods: number[], food: Food) => {
      return favoriteFoods.includes(food.id)
    }

    // Sort favorites first
    const sortedFoods = foods.sort((a, b) => {
      if (
        isFavorite(favoriteConsumables, a) &&
        !isFavorite(favoriteConsumables, b)
      ) {
        return -1 // a comes first
      }

      if (
        !isFavorite(favoriteConsumables, a) &&
        isFavorite(favoriteConsumables, b)
      ) {
        return 1 // b comes first
      }

      return 0
    })

    const recipes = await listRecipes(userId)

    setSearching(false) // TODO: Refactor to use loading state instead of searchingFoods

    const consumables = [...recipes, ...sortedFoods]

    setConsumables({
      loading: false,
      errored: false,
      data: consumables,
    })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // TODO: Add proper error handling for all user.errored, days.errored and foods.errored checks
    if (user.loading || user.errored || typing) {
      return
    }

    fetchConsumables(search, user.data.favorite_foods, user.data.id)
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

  if (consumables.loading) {
    return <PageLoading message="Carregando alimentos" />
  }

  if (consumables.errored) {
    return (
      <PageLoading message="Erro ao carregar alimentos. Tente novamente mais tarde" />
    )
  }

  const filteredConsumables = consumables.data
    .filter((consumable) => {
      if (search === '') {
        return true
      }

      // Fuzzy search
      const searchLower = search.toLowerCase()
      const nameLower = consumable.name.toLowerCase()
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

  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    await onNewItemGroup(newGroup)
    // Prompt if user wants to add another item or go back (Yes/No)
    const oneMore = confirm(
      'Item adicionado com sucesso. Deseja adicionar outro item?',
    )

    if (!oneMore) {
      onFinish()
    } else {
      setSelectedConsumable(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
      foodItemEditModalRef.current?.close()
    }
  }

  return (
    <>
      <BarCode
        barCodeInsertModalRef={barCodeInsertModalRef}
        foodItemEditModalRef={foodItemEditModalRef}
        setSelectedConsumable={setSelectedConsumable}
      />
      <ModalContextProvider visible={false}>
        <FoodItemEditModal
          modalId={MEAL_ITEM_ADD_MODAL_ID}
          ref={foodItemEditModalRef}
          targetName={targetName}
          foodItem={{
            reference: selectedConsumable.id,
            name: selectedConsumable.name,
            macros: selectedConsumable.macros,
            type: selectedConsumable[''] === 'Food' ? 'food' : 'recipe', // TODO: Refactor
          }}
          onApply={async (item) => {
            if (item.type === 'food') {
              const newGroup: SimpleItemGroup = {
                id: Math.round(Math.random() * 1000000),
                name: item.name,
                items: [item],
                type: 'simple',
                quantity: item.quantity,
              }
              handleNewItemGroup(newGroup)
            } else {
              const newGroup: RecipedItemGroup = {
                id: Math.round(Math.random() * 1000000),
                name: item.name,
                items: [...(selectedConsumable as Recipe).items],
                type: 'recipe',
                quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
                recipe: (selectedConsumable as Recipe).id,
              }
              handleNewItemGroup(newGroup)
            }
          }}
        />
      </ModalContextProvider>
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
        filteredConsumables={filteredConsumables}
        barCodeInsertModalRef={barCodeInsertModalRef}
        foodItemEditModalRef={foodItemEditModalRef}
        searchingFoods={searching}
        isFoodFavorite={isFoodFavorite}
        setFoodAsFavorite={setFoodAsFavorite}
        setSelectedConsumable={setSelectedConsumable}
        typing={typing}
      />
    </>
  )
}

const BarCode = ({
  barCodeInsertModalRef,
  foodItemEditModalRef,
  setSelectedConsumable,
}: {
  barCodeInsertModalRef: React.RefObject<ModalRef>
  foodItemEditModalRef: React.RefObject<ModalRef>
  setSelectedConsumable: (food: Food) => void
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
        setSelectedConsumable(food)
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
  filteredConsumables,
  isFoodFavorite,
  setFoodAsFavorite,
  setSelectedConsumable,
  foodItemEditModalRef,
  barCodeInsertModalRef,
}: {
  search: string
  searchingFoods: boolean
  typing: boolean
  filteredConsumables: Template[]
  isFoodFavorite: (food: number) => boolean
  setFoodAsFavorite: (food: number, favorite: boolean) => void
  setSelectedConsumable: (food: Template) => void
  foodItemEditModalRef: React.RefObject<ModalRef>
  barCodeInsertModalRef: React.RefObject<ModalRef>
}) => {
  return (
    <>
      {!searchingFoods &&
        !typing &&
        filteredConsumables.length ===
          /* TODO: Check if equality is a bug */ 0 && (
          <Alert color="warning" className="mt-2">
            Nenhum alimento encontrado para a busca &quot;{search}&quot;.
          </Alert>
        )}

      <div className="bg-gray-800 p-1">
        {searchingFoods && filteredConsumables.length === 0 ? (
          <PageLoading message="Carregando alimentos" />
        ) : (
          <>
            {filteredConsumables.map((consumable, idx) => (
              <React.Fragment key={idx}>
                <FoodItemView
                  foodItem={{
                    id: Math.random() * 1000000,
                    name: consumable.name,
                    quantity: 100,
                    macros: consumable.macros,
                    reference: consumable.id,
                    type: consumable[''] === 'Food' ? 'food' : 'recipe', // TODO: Refactor
                  }}
                  className="mt-1"
                  onClick={() => {
                    setSelectedConsumable(consumable)
                    foodItemEditModalRef.current?.showModal()
                    barCodeInsertModalRef.current?.close()
                  }}
                  header={
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={isFoodFavorite(consumable.id)}
                          onSetFavorite={(favorite) =>
                            setFoodAsFavorite(consumable.id, favorite)
                          }
                        />
                      }
                    />
                  }
                  nutritionalInfo={<FoodItemView.NutritionalInfo />}
                />
              </React.Fragment>
            ))}
            {searchingFoods && filteredConsumables.length > 0 && (
              <LoadingRing />
            )}
          </>
        )}
      </div>
    </>
  )
}
