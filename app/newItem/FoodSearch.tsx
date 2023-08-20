'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { Food } from '@/model/foodModel'
import { Alert } from 'flowbite-react'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { Loadable } from '@/utils/loadable'
import { Recipe } from '@/model/recipeModel'
import { mockFood } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider } from '../(modals)/ModalContext'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/foodItemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { useFoodContext } from '@/context/food.context'

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal'
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal'

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search

export type FoodSearchProps = {
  targetName: string
  onNewItemGroup?: (foodItem: ItemGroup) => Promise<void>
  onFinish?: () => void
}

export type Template = Food | Recipe

// TODO: Rename to TemplateSearch?
export default function FoodSearch({
  targetName,
  onNewItemGroup = async () => undefined,
  onFinish = () => undefined,
}: FoodSearchProps) {
  const FOOD_LIMIT = 100
  const TYPE_TIMEOUT = 1000

  const { show: showConfirmModal } = useConfirmModalContext()

  const [search, setSearch] = useState<string>('')
  // TODO: rename all consumables to templates
  const [templates, setTemplates] = useState<Loadable<Template[]>>({
    loading: true,
  })

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )

  const [barCodeModalVisible, setBarCodeModalVisible] = useState(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)

  const [typing, setTyping] = useState(false)

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window

  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop

  const { foods, refetchFoods } = useFoodContext()

  useEffect(() => {
    if (foods.loading) {
      setTemplates({ loading: true })
      return
    }

    if (foods.errored) {
      setTemplates({ loading: false, errored: true, error: foods.error })
      showConfirmModal({
        title: 'Erro ao carregar alimentos',
        message: 'Deseja tentar novamente?',
        onConfirm: () => {
          refetchFoods()
        },
      })
      return
    }

    setTemplates({
      loading: false,
      errored: false,
      data: foods.data,
    })

    // TODO: Add recipes to templates
  }, [foods, refetchFoods, showConfirmModal])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // TODO: Add proper error handling for all user.errored, days.errored and foods.errored checks
    if (typing) {
      return
    }

    refetchFoods(search)
  }, [refetchFoods, search, typing])

  // TODO: Create custom hook for typing "const { typing, startTyping } = useTyping(timeout: number)"
  useEffect(() => {
    setTyping(true)

    const timeout = setTimeout(() => {
      setTyping(false)
    }, TYPE_TIMEOUT)

    return () => {
      clearTimeout(timeout)
    }
  }, [search])

  if (templates.loading) {
    return <PageLoading message="Carregando alimentos e receitas" />
  }

  if (templates.errored) {
    return (
      <PageLoading
        message={`Erro ao carregar alimentos e receitas: ${JSON.stringify(
          templates.error,
          null,
          2,
        )}. Tente novamente.`}
      />
    )
  }

  const filteredConsumables = templates.data
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
        setSelectedTemplate(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
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
        setSelectedConsumable={setSelectedTemplate}
      />
      <ModalContextProvider
        visible={foodItemEditModalVisible}
        setVisible={setFoodItemEditModalVisible}
      >
        <FoodItemEditModal
          modalId={MEAL_ITEM_ADD_MODAL_ID}
          targetName={targetName}
          foodItem={{
            reference: selectedTemplate.id,
            name: selectedTemplate.name,
            macros: selectedTemplate.macros,
            type: selectedTemplate[''] === 'Food' ? 'food' : 'recipe', // TODO: Refactor
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
                items: [...(selectedTemplate as Recipe).items],
                type: 'recipe',
                quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
                recipe: (selectedTemplate as Recipe).id,
              }
              handleNewItemGroup(newGroup)
            }
          }}
        />
      </ModalContextProvider>
      <Tabs />
      <SearchBar isDesktop={isDesktop} search={search} setSearch={setSearch} />
      <SearchResults
        search={search}
        filteredConsumables={filteredConsumables}
        setBarCodeModalVisible={setBarCodeModalVisible}
        setFoodItemEditModalVisible={setFoodItemEditModalVisible}
        setSelectedConsumable={setSelectedTemplate}
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
  typing,
  filteredConsumables,
  setSelectedConsumable,
  setBarCodeModalVisible,
  setFoodItemEditModalVisible,
}: {
  search: string
  typing: boolean
  filteredConsumables: Template[]
  setSelectedConsumable: (food: Template) => void
  setBarCodeModalVisible: Dispatch<SetStateAction<boolean>>
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
}) => {
  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  return (
    <>
      {!typing && filteredConsumables.length === 0 && (
        <Alert color="warning" className="mt-2">
          Nenhum alimento encontrado para a busca &quot;{search}&quot;.
        </Alert>
      )}

      <div className="bg-gray-800 p-1">
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
      </div>
    </>
  )
}
