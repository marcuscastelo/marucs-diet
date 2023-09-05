'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { Food } from '@/model/foodModel'
import { Alert, Tabs } from 'flowbite-react'
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
} from '@/model/itemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { useFoodContext } from '@/context/food.context'
import { generateId } from '@/utils/idUtils'
import { FoodSearchTabs, TemplateFilter, avaliableTabs } from './FoodSearchTabs'

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

  // TODO: Create DEFAULT_TAB constant
  const [currentTab, setCurrentTab] =
    useState<(typeof avaliableTabs)[keyof typeof avaliableTabs]['id']>('all')

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }), // TODO: Properly handle no food selected
  )

  const [barCodeModalVisible, setBarCodeModalVisible] = useState(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)

  const [typing, setTyping] = useState(false)

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window

  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop

  const { foods: allFoods, favoriteFoods, refetchFoods } = useFoodContext()

  const foods = currentTab === 'favorites' ? favoriteFoods : allFoods

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

  const searchFilteredTemlates = templates.data
    .filter((template) => {
      if (search === '') {
        return true
      }

      // Fuzzy search
      const searchLower = search.toLowerCase()
      const nameLower = template.name.toLowerCase()
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
      <ExternalFoodItemEditModal
        foodItemEditModalVisible={foodItemEditModalVisible}
        setFoodItemEditModalVisible={setFoodItemEditModalVisible}
        selectedTemplate={selectedTemplate}
        targetName={targetName}
        handleNewItemGroup={handleNewItemGroup}
      />
      <FoodSearchTabs
        onTabChange={(id) => {
          setCurrentTab(id)
        }}
      />
      <SearchBar isDesktop={isDesktop} search={search} setSearch={setSearch} />
      <SearchResults
        search={search}
        filteredTemplates={searchFilteredTemlates}
        setBarCodeModalVisible={setBarCodeModalVisible}
        setFoodItemEditModalVisible={setFoodItemEditModalVisible}
        setSelectedTemplate={setSelectedTemplate}
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

function ExternalFoodItemEditModal({
  foodItemEditModalVisible,
  setFoodItemEditModalVisible,
  selectedTemplate,
  targetName,
  handleNewItemGroup,
}: {
  foodItemEditModalVisible: boolean
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
  selectedTemplate: Template
  targetName: string
  handleNewItemGroup: (newGroup: ItemGroup) => Promise<void>
}) {
  return (
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
              id: generateId(),
              name: item.name,
              items: [item],
              type: 'simple',
              quantity: item.quantity,
            }
            handleNewItemGroup(newGroup)
          } else {
            const newGroup: RecipedItemGroup = {
              id: generateId(),
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
  filteredTemplates,
  setSelectedTemplate,
  setBarCodeModalVisible,
  setFoodItemEditModalVisible,
}: {
  search: string
  typing: boolean
  filteredTemplates: Template[]
  setSelectedTemplate: (food: Template) => void
  setBarCodeModalVisible: Dispatch<SetStateAction<boolean>>
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
}) => {
  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  return (
    <>
      {!typing && filteredTemplates.length === 0 && (
        <Alert color="warning" className="mt-2">
          Nenhum alimento encontrado para a busca &quot;{search}&quot;.
        </Alert>
      )}

      <div className="bg-gray-800 p-1">
        {filteredTemplates.map((template, idx) => (
          <React.Fragment key={idx}>
            <FoodItemView
              foodItem={{
                id: generateId(),
                name: template.name,
                quantity: 100,
                macros: template.macros,
                reference: template.id,
                type: template[''] === 'Food' ? 'food' : 'recipe', // TODO: Refactor
              }}
              className="mt-1"
              onClick={() => {
                setSelectedTemplate(template)
                setFoodItemEditModalVisible(true)
                setBarCodeModalVisible(false)
              }}
              header={
                <FoodItemView.Header
                  name={<FoodItemView.Header.Name />}
                  favorite={
                    <FoodItemView.Header.Favorite
                      favorite={isFoodFavorite(template.id)}
                      onSetFavorite={(favorite) =>
                        setFoodAsFavorite(template.id, favorite)
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
