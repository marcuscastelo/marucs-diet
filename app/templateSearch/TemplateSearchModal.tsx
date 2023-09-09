'use client'

import Modal from '../(modals)/Modal'
import { useModalContext, ModalContextProvider } from '../(modals)/ModalContext'
import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { Food } from '@/model/foodModel'
import { Alert } from 'flowbite-react'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { Recipe } from '@/model/recipeModel'
import { mockFood } from '../test/unit/(mock)/mockData'
import PageLoading from '../PageLoading'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { useUserContext } from '@/context/users.context'
import {
  ItemGroup,
  RecipedItemGroup,
  SimpleItemGroup,
} from '@/model/itemGroupModel'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { useFoodContext } from '@/context/food.context'
import { generateId } from '@/utils/idUtils'
import { TemplateSearchTabs, avaliableTabs } from './TemplateSearchTabs'
import { ObjectValues } from '@/utils/typeUtils'
import { useTyping } from '@/hooks/typing'

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (foodItem: ItemGroup) => Promise<void>
  onFinish?: () => void
}

// TODO: Create zod model for template?
export type Template = Food | Recipe

export function TemplateSearchModal({
  targetName,
  onNewItemGroup,
  onFinish,
}: TemplateSearchModalProps) {
  const { visible, onSetVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)

  const [barCodeModalVisible, setBarCodeModalVisible] = useState(false)

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    mockFood({ name: 'BUG: SELECTED TEMPLATE NOT SET' }), // TODO: Properly handle no template selected
  )

  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    // TODO: await onNewItemGroup?
    await onNewItemGroup?.(newGroup)
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
        setSelectedTemplate(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
        setFoodItemEditModalVisible(false)
        onFinish?.()
      },
    })
  }

  console.debug(`[TemplateSearchModal] Render`)
  return (
    <>
      <ModalContextProvider
        visible={visible}
        onSetVisible={(visible) => onSetVisible(visible)}
      >
        <Modal
          header={<Modal.Header title="Busca de alimentos" />}
          body={
            <div className="max-h-full">
              {visible && (
                <TemplateSearch
                  setBarCodeModalVisible={setBarCodeModalVisible}
                  setFoodItemEditModalVisible={setFoodItemEditModalVisible}
                  setSelectedTemplate={setSelectedTemplate}
                />
              )}
            </div>
          }
        />
      </ModalContextProvider>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        onSetVisible={setFoodItemEditModalVisible}
        selectedTemplate={selectedTemplate}
        targetName={targetName}
        onNewItemGroup={handleNewItemGroup}
      />
      <ModalContextProvider
        visible={barCodeModalVisible}
        onSetVisible={setBarCodeModalVisible}
      >
        <BarCodeInsertModal
          onSelect={(template) => {
            setSelectedTemplate(template)
            setFoodItemEditModalVisible(true)
          }}
        />
      </ModalContextProvider>
    </>
  )
}

export function TemplateSearch({
  setBarCodeModalVisible,
  setFoodItemEditModalVisible,
  setSelectedTemplate,
}: {
  setBarCodeModalVisible: Dispatch<SetStateAction<boolean>>
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
  setSelectedTemplate: (food: Template) => void
}) {
  const TEMPLATE_SEARCH_LIMIT = 100
  const TYPING_TIMEOUT_MS = 1000

  const { foods, favoriteFoods, refetchFoods } = useFoodContext()

  const [isClient, setIsClient] = useState(false) // TODO: Stop using isClient and typeof window
  const isDesktop = isClient ? window.innerWidth > 768 : false // TODO: Stop using innerWidth to detect desktop
  useEffect(() => setIsClient(true), [])

  const [search, setSearch_] = useState<string>('')
  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => refetchFoods(search),
  })

  const setSearch = (search: string) => {
    setSearch_(search)
    onTyped()
  }

  // TODO: Create DEFAULT_TAB constant
  type AvailableTab = ObjectValues<typeof avaliableTabs>['id']
  const [tab, setTab] = useState<AvailableTab>('all')
  const templates = tab === 'favorites' ? favoriteFoods : foods

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
    .slice(0, TEMPLATE_SEARCH_LIMIT)

  return (
    <>
      <BarCodeButton showBarCodeModal={() => setBarCodeModalVisible(true)} />

      <TemplateSearchTabs onTabChange={setTab} />
      <SearchBar
        isDesktop={isDesktop}
        search={search}
        onSetSearch={setSearch}
      />
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

// TODO: Extract to components
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

// TODO: Extract to components
function ExternalFoodItemEditModal({
  visible,
  onSetVisible,
  selectedTemplate,
  targetName,
  onNewItemGroup,
}: {
  visible: boolean
  onSetVisible: Dispatch<SetStateAction<boolean>>
  selectedTemplate: Template
  targetName: string
  onNewItemGroup: (newGroup: ItemGroup) => Promise<void>
}) {
  return (
    <ModalContextProvider visible={visible} onSetVisible={onSetVisible}>
      <FoodItemEditModal
        targetName={targetName}
        foodItem={{
          reference: selectedTemplate.id,
          name: selectedTemplate.name,
          macros: selectedTemplate.macros,
          type: selectedTemplate[''] === 'Food' ? 'food' : 'recipe', // TODO: Refactor conversion off template type to group and item types
        }}
        onApply={async (item) => {
          // TODO: Refactor conversion off template type to group and item types
          if (item.type === 'food') {
            const newGroup: SimpleItemGroup = {
              id: generateId(),
              name: item.name,
              items: [item],
              type: 'simple',
              quantity: item.quantity,
            }
            onNewItemGroup(newGroup)
          } else {
            const newGroup: RecipedItemGroup = {
              id: generateId(),
              name: item.name,
              items: [...(selectedTemplate as Recipe).items],
              type: 'recipe',
              quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
              recipe: (selectedTemplate as Recipe).id,
            }
            onNewItemGroup(newGroup)
          }
        }}
      />
    </ModalContextProvider>
  )
}

// TODO: Extract to components
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

// TODO: Extract to components
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
