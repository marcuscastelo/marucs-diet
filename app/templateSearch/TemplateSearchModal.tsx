'use client'

import Modal from '../(modals)/Modal'
import { useModalContext, ModalContextProvider } from '../(modals)/ModalContext'
import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { Alert } from 'flowbite-react'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { Recipe } from '@/model/recipeModel'
import { mockFood } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { useUserContext, useUserId } from '@/context/users.context'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/itemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { useFoodContext } from '@/context/template.context'
import { generateId } from '@/utils/idUtils'
import {
  AvailableTab,
  TemplateSearchTabs,
  chooseFoodsFromStore as chooseFoodsFromFoodStore,
} from './TemplateSearchTabs'
import { useTyping } from '@/hooks/typing'
import { createFoodItem } from '@/model/foodItemModel'
import {
  fetchRecentFoodByUserIdAndFoodId,
  insertRecentFood,
  updateRecentFood,
} from '@/controllers/recentFood'
import { createRecentFood } from '@/model/recentFoodModel'
import { Template } from '@/model/templateModel'
import { TemplateItem } from '@/model/templateItemModel'
import {
  ReadonlySignal,
  Signal,
  computed,
  useSignal,
} from '@preact/signals-react'

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (
    foodItem: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
  onFinish?: () => void
}

export function TemplateSearchModal({
  targetName,
  onNewItemGroup,
  onFinish,
}: TemplateSearchModalProps) {
  const userId = useUserId()
  const { visible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const foodItemEditModalVisible = useSignal(false)

  const barCodeModalVisible = useSignal(false)

  const selectedTemplate = useSignal<Template>(
    mockFood({ name: 'BUG: SELECTED TEMPLATE NOT SET' }), // TODO: Properly handle no template selected
  )

  const handleNewItemGroup = async (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => {
    await onNewItemGroup?.(newGroup, originalAddedItem)

    const recentFood = await fetchRecentFoodByUserIdAndFoodId(
      userId,
      originalAddedItem.reference,
    )

    if (
      recentFood &&
      (recentFood.user_id !== userId ||
        recentFood.food_id !== originalAddedItem.reference)
    ) {
      // TODO: Remove recent food assertion once unit tests are in place
      throw new Error('BUG: recentFood fetched does not match user and food')
    }

    const newRecentFood = createRecentFood({
      ...recentFood,
      user_id: userId,
      food_id: originalAddedItem.reference,
    })

    if (recentFood) {
      updateRecentFood(recentFood.id, newRecentFood)
    } else {
      insertRecentFood(newRecentFood)
    }

    // Prompt if user wants to add another item or go back (Yes/No)
    // TODO: Show Yes/No instead of Ok/Cancel on modal
    showConfirmModal({
      title: 'Item adicionado com sucesso',
      body: 'Deseja adicionar outro item ou finalizar a inclusão?',
      actions: [
        {
          text: 'Adicionar mais um item',
          onClick: () => {
            // TODO: Fix "Add another item" button: it is not refreshing client-side data
            alert('Funcionalidade desabilitada temporariamente') // TODO: Change all alerts with ConfirmModal
            // Code from "Finalizar" button
            selectedTemplate.value = mockFood({
              name: 'BUG: SELECTED FOOD NOT SET',
            })
            foodItemEditModalVisible.value = false
            onFinish?.()
            // -- End of "Finalizar" button code
            return
            // TODO: Remove mockFood as default selected food
            selectedTemplate.value = mockFood({
              name: 'BUG: SELECTED FOOD NOT SET',
            })
            foodItemEditModalVisible.value = false
          },
        },
        {
          text: 'Finalizar',
          primary: true,
          onClick: () => {
            // TODO: Remove mockFood as default selected food
            selectedTemplate.value = mockFood({
              name: 'BUG: SELECTED FOOD NOT SET',
            })
            foodItemEditModalVisible.value = false
            onFinish?.()
          },
        },
      ],
    })
  }

  console.debug(`[TemplateSearchModal] Render`)
  return (
    <>
      <ModalContextProvider visible={visible}>
        <Modal
          header={<Modal.Header title="Busca de alimentos" />}
          body={
            <div className="max-h-full">
              {visible.value && (
                <TemplateSearch
                  barCodeModalVisible={barCodeModalVisible}
                  foodItemEditModalVisible={foodItemEditModalVisible}
                  setSelectedTemplate={(template) =>
                    (selectedTemplate.value = template)
                  }
                />
              )}
            </div>
          }
        />
      </ModalContextProvider>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        selectedTemplate={selectedTemplate}
        targetName={targetName}
        onNewItemGroup={handleNewItemGroup}
      />
      <ExternalBarCodeInsertModal
        visible={barCodeModalVisible}
        onSelect={(template) => {
          selectedTemplate.value = template
          foodItemEditModalVisible.value = true
        }}
      />
    </>
  )
}

export function TemplateSearch({
  barCodeModalVisible,
  foodItemEditModalVisible,
  setSelectedTemplate,
}: {
  barCodeModalVisible: Signal<boolean>
  foodItemEditModalVisible: Signal<boolean>
  setSelectedTemplate: (food: Template) => void
}) {
  const TEMPLATE_SEARCH_LIMIT = 100
  const TYPING_TIMEOUT_MS = 1000

  const { foods, favoriteFoods, recentFoods, refetchFoods, recipes } =
    useFoodContext()

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window
  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop
  useEffect(() => setIsClient(true), [])

  const [search, setSearch_] = useState<string>('')
  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => refetchFoods('all', search), // TODO: Change 'all' to selected tab
  })

  const setSearch = (search: string) => {
    setSearch_(search)
    onTyped()
  }

  // TODO: Create DEFAULT_TAB constant
  const [tab, setTab] = useState<AvailableTab>('all')
  const templates = chooseFoodsFromFoodStore(tab, {
    foods,
    favoriteFoods,
    recentFoods,
    recipes,
  })

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

  if (templates.data === null) {
    return (
      <PageLoading
        message={`Erro ao carregar alimentos e receitas: data is null. Tente novamente.`}
      />
    )
  }

  const searchFilteredTemplates = templates.data
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
    .slice(0, TEMPLATE_SEARCH_LIMIT)

  return (
    <>
      <BarCodeButton
        showBarCodeModal={() => (barCodeModalVisible.value = true)}
      />

      <TemplateSearchTabs onTabChange={setTab} />
      <SearchBar
        isDesktop={isDesktop}
        search={search}
        onSetSearch={setSearch}
      />
      <SearchResults
        search={search}
        filteredTemplates={searchFilteredTemplates}
        barCodeModalVisible={barCodeModalVisible}
        foodItemEditModalVisible={foodItemEditModalVisible}
        setSelectedTemplate={setSelectedTemplate}
        typing={typing}
      />
    </>
  )
}

// TODO: Extract to components on other files
const BarCodeButton = ({
  showBarCodeModal,
}: {
  showBarCodeModal: () => void
}) => (
  <>
    <div className="mb-2 flex justify-start">
      <button
        // TODO: Add BarCode icon instead of text
        onClick={() => {
          showBarCodeModal()
        }}
        className="mt-2 rounded bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
      >
        Inserir código de barras
      </button>
    </div>
  </>
)

// TODO: Extract to components on other files
function ExternalFoodItemEditModal({
  visible,
  selectedTemplate,
  targetName,
  onNewItemGroup,
}: {
  visible: Signal<boolean>
  selectedTemplate: ReadonlySignal<Template>
  targetName: string
  onNewItemGroup: (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
}) {
  return (
    <ModalContextProvider visible={visible}>
      <FoodItemEditModal
        targetName={targetName}
        foodItem={computed(() => ({
          reference: selectedTemplate.value.id,
          name: selectedTemplate.value.name,
          macros: selectedTemplate.value.macros,
          __type:
            selectedTemplate.value.__type === 'Food'
              ? 'FoodItem'
              : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
        }))}
        onApply={async (item) => {
          // TODO: Refactor conversion from template type to group/item types
          if (item.__type === 'FoodItem') {
            const newGroup: SimpleItemGroup = {
              id: generateId(),
              name: item.name,
              items: [item],
              type: 'simple',
              quantity: item.quantity,
            }
            onNewItemGroup(newGroup, item)
          } else {
            const newGroup: RecipedItemGroup = {
              id: generateId(),
              name: item.name,
              items: [...(selectedTemplate.value as Recipe).items],
              type: 'recipe',
              quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
              recipe: (selectedTemplate.value as Recipe).id,
            }
            onNewItemGroup(newGroup, item)
          }
        }}
      />
    </ModalContextProvider>
  )
}

// TODO: Extract to components on other files
function ExternalBarCodeInsertModal({
  visible,
  onSelect,
}: {
  visible: Signal<boolean>
  onSelect: (template: Template) => void
}) {
  return (
    <ModalContextProvider visible={visible}>
      <BarCodeInsertModal onSelect={onSelect} />
    </ModalContextProvider>
  )
}

// TODO: Extract to components on other files
const SearchBar = ({
  isDesktop,
  search,
  onSetSearch,
}: {
  isDesktop: boolean
  search: string
  onSetSearch: (search: string) => void
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
      onChange={(e) => onSetSearch(e.target.value)}
      type="search"
      id="default-search"
      className="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Buscar alimentos"
      required
    />
  </div>
)

// TODO: Extract to components on other files
const SearchResults = ({
  search,
  typing,
  filteredTemplates,
  setSelectedTemplate,
  barCodeModalVisible,
  foodItemEditModalVisible,
}: {
  search: string
  typing: boolean
  filteredTemplates: Template[] // TODO: convert to signal
  setSelectedTemplate: (food: Template) => void
  barCodeModalVisible: Signal<boolean>
  foodItemEditModalVisible: Signal<boolean>
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
              foodItem={computed(() => ({
                ...createFoodItem({
                  name: template.name,
                  quantity: 100,
                  macros: template.macros,
                  reference: template.id,
                }),
                __type: template.__type === 'Food' ? 'FoodItem' : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
              }))}
              className="mt-1"
              onClick={() => {
                setSelectedTemplate(template)
                foodItemEditModalVisible.value = true
                barCodeModalVisible.value = false
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
