'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert } from 'flowbite-react'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import LoadingRing from '@/app/LoadingRing'
import { Recipe } from '@/model/recipeModel'
import { mockFood } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider } from '../(modals)/ModalContext'
import { listRecipes } from '@/controllers/recipes'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/foodItemGroupModel'
import SearchBar from '@/components/SearchBar'
import { useConfirmModalContext } from '@/context/confirmModal.context'

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

  const { show: showConfirmModal } = useConfirmModalContext()

  const [search, setSearch] = useState<string>('')
  // TODO: rename all consumables to templates
  const [consumables, setConsumables] = useState<Loadable<Template[]>>({
    loading: true,
  })

  const [selectedConsumable, setSelectedConsumable] = useState<Template>(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )

  const [barCodeModalVisible, setBarCodeModalVisible] = useState(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)
  const [recipeEditModalVisible, setRecipeEditModalVisible] = useState(false)

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
    onNewItemGroup(newGroup)
    // Prompt if user wants to add another item or go back (Yes/No)
    // TODO: Allow modal to show Yes/No instead of Ok/Cancel

    showConfirmModal({
      title: 'Item adicionado com sucesso',
      message: 'Deseja adicionar outro item?',
      onConfirm: () => {
        // TODO: Remove mockFood as default selected food
        setSelectedConsumable(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
        setFoodItemEditModalVisible(false)
      },
      onCancel: () => {
        onFinish()
      },
    })
  }

  return (
    <>
      <BarCode
        barCodeModalVisible={barCodeModalVisible}
        setBarCodeModalVisible={setBarCodeModalVisible}
        setFoodItemEditModalVisible={setFoodItemEditModalVisible}
        setSelectedConsumable={setSelectedConsumable}
      />
      <ModalContextProvider
        visible={foodItemEditModalVisible}
        setVisible={setFoodItemEditModalVisible}
      >
        <FoodItemEditModal
          modalId={MEAL_ITEM_ADD_MODAL_ID}
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
        setBarCodeModalVisible={setBarCodeModalVisible}
        setFoodItemEditModalVisible={setFoodItemEditModalVisible}
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
  barCodeModalVisible,
  setBarCodeModalVisible,
  setFoodItemEditModalVisible,
  setSelectedConsumable,
}: {
  barCodeModalVisible: boolean
  setBarCodeModalVisible: Dispatch<SetStateAction<boolean>>
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
  setSelectedConsumable: (food: Food) => void
}) => (
  <>
    <div className="mb-2 flex justify-start">
      <button
        onClick={() => {
          setBarCodeModalVisible(true)
        }}
        className="mt-2 rounded bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
      >
        Inserir código de barras
      </button>
    </div>
    <ModalContextProvider
      visible={barCodeModalVisible}
      setVisible={setBarCodeModalVisible}
    >
      <BarCodeInsertModal
        modalId={BAR_CODE_INSERT_MODAL_ID}
        onSelect={(food) => {
          setSelectedConsumable(food)
          setFoodItemEditModalVisible(true)
        }}
      />
    </ModalContextProvider>
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

const SearchResults = ({
  search,
  searchingFoods,
  typing,
  filteredConsumables,
  isFoodFavorite,
  setFoodAsFavorite,
  setSelectedConsumable,
  setBarCodeModalVisible,
  setFoodItemEditModalVisible,
}: {
  search: string
  searchingFoods: boolean
  typing: boolean
  filteredConsumables: Template[]
  isFoodFavorite: (food: number) => boolean
  setFoodAsFavorite: (food: number, favorite: boolean) => void
  setSelectedConsumable: (food: Template) => void
  setBarCodeModalVisible: Dispatch<SetStateAction<boolean>>
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
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
                    setFoodItemEditModalVisible(true)
                    setBarCodeModalVisible(false)
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
