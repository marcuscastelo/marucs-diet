import { Modal, ModalHeader } from '@/sections/common/components/Modal'
import {
  useModalContext,
  ModalContextProvider
} from '@/sections/common/context/ModalContext'
import { FoodItemFavorite, FoodItemHeader, FoodItemName, FoodItemNutritionalInfo, FoodItemView } from '@/sections/food-item/components/FoodItemView'
import BarCodeInsertModal from '@/sections/barcode/components/BarCodeInsertModal'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { FoodItemEditModal } from '@/sections/food-item/components/FoodItemEditModal'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup
} from '@/modules/diet/item-group/domain/itemGroup'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { useFoodContext } from '@/sections/template/context/TemplateContext'
import { addId, generateId } from '@/legacy/utils/idUtils'
import {
  type AvailableTab,
  TemplateSearchTabs,
  chooseFoodsFromStore as chooseFoodsFromFoodStore
} from '@/sections/search/components/TemplateSearchTabs'
import { useTyping } from '@/sections/common/hooks/useTyping'
import { createFoodItem } from '@/modules/diet/food-item/domain/foodItem'
import {
  fetchRecentFoodByUserIdAndFoodId,
  insertRecentFood,
  updateRecentFood
} from '@/legacy/controllers/recentFood'
import { createRecentFood } from '@/modules/recent-food/domain/recentFood'
import { type Template } from '@/modules/diet/template/domain/template'
import { type TemplateItem } from '@/modules/diet/template-item/domain/templateItem'

import { createFood } from '@/modules/diet/food/domain/food'
import {
  currentUserId,
  isFoodFavorite,
  setFoodAsFavorite
} from '@/modules/user/application/user'
import { type Accessor, Show, createSignal, type Setter, For } from 'solid-js'
import { Alert } from '@/sections/common/components/Alert'

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (
    foodItem: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => void
  onFinish?: () => void
}

export function TemplateSearchModal (props: TemplateSearchModalProps) {
  const userId = currentUserId()
  const { visible, setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] = createSignal(false)

  const [barCodeModalVisible, setBarCodeModalVisible] = createSignal(false)

  const [selectedTemplate, setSelectedTemplate] = createSignal<Template>(
    addId(createFood({ name: 'BUG: SELECTED TEMPLATE NOT SET' })) // TODO: Properly handle no template selected
  )

  const handleNewItemGroup = async (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem
  ) => {
    props.onNewItemGroup?.(newGroup, originalAddedItem)

    if (userId === null) {
      throw new Error('User is null')
    }

    const recentFood = await fetchRecentFoodByUserIdAndFoodId(
      userId,
      originalAddedItem.reference
    )

    if (
      recentFood !== null &&
      (recentFood.user_id !== userId ||
        recentFood.food_id !== originalAddedItem.reference)
    ) {
      // TODO: Remove recent food assertion once unit tests are in place
      throw new Error('BUG: recentFood fetched does not match user and food')
    }

    const newRecentFood = createRecentFood({
      ...recentFood,
      user_id: userId,
      food_id: originalAddedItem.reference
    })

    if (recentFood !== null) {
      await updateRecentFood(recentFood.id, newRecentFood)
    } else {
      await insertRecentFood(newRecentFood)
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
            setSelectedTemplate(addId(
              createFood({
                name: 'BUG: SELECTED FOOD NOT SET'
              })
            ))
            setFoodItemEditModalVisible(false)
            props.onFinish?.()
            // -- End of "Finalizar" button code

            // TODO: Remove createFood as default selected food
            // selectedTemplate.value = addId(
            //   createFood({
            //     name: 'BUG: SELECTED FOOD NOT SET'
            //   })
            // )
            // foodItemEditModalVisible.value = false
          }
        },
        {
          text: 'Finalizar',
          primary: true,
          onClick: () => {
            // TODO: Remove createFood as default selected food
            setSelectedTemplate(addId(
              createFood({
                name: 'BUG: SELECTED FOOD NOT SET'
              })
            ))
            setFoodItemEditModalVisible(false)
            props.onFinish?.()
          }
        }
      ]
    })
  }

  console.debug('[TemplateSearchModal] Render')
  return (
    <>
      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          header={<ModalHeader title="Busca de alimentos" />}
          body={
            <div class="max-h-full">
              <Show when={visible}>
                <TemplateSearch
                  barCodeModalVisible={barCodeModalVisible}
                  setBarCodeModalVisible={setBarCodeModalVisible}
                  foodItemEditModalVisible={foodItemEditModalVisible}
                  setFoodItemEditModalVisible={setFoodItemEditModalVisible}
                  setSelectedTemplate={setSelectedTemplate}
                />
              </Show>
            </div>
          }
        />
      </ModalContextProvider>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        setVisible={setFoodItemEditModalVisible}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        targetName={props.targetName}
        onNewItemGroup={handleNewItemGroup}
      />
      <ExternalBarCodeInsertModal
        visible={barCodeModalVisible}
        setVisible={setBarCodeModalVisible}
        onSelect={(template) => {
          setSelectedTemplate(template)
          setFoodItemEditModalVisible(true)
        }}
      />
    </>
  )
}

export function TemplateSearch (props: {
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
  setSelectedTemplate: (food: Template) => void
}) {
  const TEMPLATE_SEARCH_LIMIT = 100
  const TYPING_TIMEOUT_MS = 1000

  const { foods, favoriteFoods, recentFoods, refetchFoods, recipes } =
    useFoodContext()

  // TODO: Determine if user is on desktop or mobile to set autofocus
  const isDesktop = false

  const [search, setSearch_] = createSignal<string>('')
  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => { refetchFoods('all', search()) } // TODO: Change 'all' to selected tab
  })

  const setSearch = (newSearch: string) => {
    setSearch_(newSearch)
    onTyped()
  }

  // TODO: Create DEFAULT_TAB constant
  const [tab, setTab] = createSignal<AvailableTab>('all')
  const templates = () => chooseFoodsFromFoodStore(tab(), {
    foods: foods(),
    favoriteFoods: favoriteFoods(),
    recentFoods: recentFoods(),
    recipes: recipes()
  })

  const loadedTemplatesOrNull = () => {
    const templates_ = templates()
    if (templates_.loading) {
      return null
    }

    if (templates_.errored) {
      return null
    }

    return templates_.data
  }

  const searchFilteredTemplates = () =>
    (loadedTemplatesOrNull() ?? [])
      .filter((template) => {
        if (search() === '') {
          return true
        }

        // Fuzzy search
        const searchLower = search().toLowerCase()
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
        showBarCodeModal={() => {
          console.debug('[TemplateSearchModal] showBarCodeModal')
          props.setBarCodeModalVisible(true)
        }}
      />

      <TemplateSearchTabs onTabChange={setTab} />
      <SearchBar
        isDesktop={isDesktop}
        search={search()}
        onSetSearch={setSearch}
      />
      <SearchResults
        search={search()}
        filteredTemplates={searchFilteredTemplates}
        barCodeModalVisible={props.barCodeModalVisible}
        setBarCodeModalVisible={props.setBarCodeModalVisible}
        foodItemEditModalVisible={props.foodItemEditModalVisible}
        setFoodItemEditModalVisible={props.setFoodItemEditModalVisible}
        setSelectedTemplate={props.setSelectedTemplate}
        typing={typing}
      />
    </>
  )
}

// TODO: Extract to components on other files
const BarCodeButton = (props: {
  showBarCodeModal: () => void
}) => (
  <>
    <div class="mb-2 flex justify-start">
      <button
        // TODO: Add BarCode icon instead of text
        onClick={() => {
          props.showBarCodeModal()
        }}
        class="mt-2 rounded bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
      >
        Inserir código de barras
      </button>
    </div>
  </>
)

// TODO: Extract to components on other files
function ExternalFoodItemEditModal (props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  selectedTemplate: Accessor<Template>
  setSelectedTemplate: Setter<Template>
  targetName: string
  onNewItemGroup: (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => Promise<void>
}) {
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <FoodItemEditModal
        targetName={props.targetName}
        foodItem={() => ({
          reference: props.selectedTemplate().id,
          name: props.selectedTemplate().name,
          macros: props.selectedTemplate().macros,
          __type:
            props.selectedTemplate().__type === 'Food'
              ? 'FoodItem'
              : 'RecipeItem' // TODO: Refactor conversion from template type to group/item types
        })}
        onApply={(item) => {
          // TODO: Refactor conversion from template type to group/item types
          if (item.__type === 'FoodItem') {
            const newGroup: SimpleItemGroup = {
              id: generateId(),
              name: item.name,
              items: [item],
              type: 'simple',
              quantity: item.quantity
            }
            props.onNewItemGroup(newGroup, item).catch((err) => {
              console.error(err)
              alert(JSON.stringify(err, null, 2)) // TODO: Change alert to toast
            })
          } else {
            const newGroup: RecipedItemGroup = {
              id: generateId(),
              name: item.name,
              items: [...(props.selectedTemplate() as Recipe).items],
              type: 'recipe',
              quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
              recipe: (props.selectedTemplate() as Recipe).id
            }
            props.onNewItemGroup(newGroup, item).catch((err) => {
              console.error(err)
              alert(JSON.stringify(err, null, 2)) // TODO: Change alert to toast
            })
          }
        }}
      />
    </ModalContextProvider>
  )
}

// TODO: Extract to components on other files
function ExternalBarCodeInsertModal (props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (template: Template) => void
}) {
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <BarCodeInsertModal onSelect={props.onSelect} />
    </ModalContextProvider>
  )
}

// TODO: Extract to components on other files
const SearchBar = (props: {
  isDesktop: boolean
  search: string
  onSetSearch: (search: string) => void
}) => (
  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <svg
        aria-hidden="true"
        class="h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <input
      autofocus={props.isDesktop}
      value={props.search}
      onChange={(e) => { props.onSetSearch(e.target.value) }}
      type="search"
      id="default-search"
      class="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Buscar alimentos"
      required
    />
  </div>
)

// TODO: Extract to components on other files
const SearchResults = (props: {
  search: string
  typing: Accessor<boolean>
  filteredTemplates: Accessor<Template[]>
  setSelectedTemplate: (food: Template) => void
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
}) => {
  return (
    <>
      {!props.typing() && props.filteredTemplates().length === 0 && (
        <Alert color="yellow" class="mt-2">
          Nenhum alimento encontrado para a busca &quot;{props.search}&quot;.
        </Alert>
      )}

      <div class="bg-gray-800 p-1">
        <For each={props.filteredTemplates()}>
        {((_, idx) => {
          const template = () => props.filteredTemplates()[idx()]
          return (
            <>
              <FoodItemView
                foodItem={() => ({
                  ...createFoodItem({
                    name: template().name,
                    quantity: 100,
                    macros: template().macros,
                    reference: template().id
                  }),
                  __type:
                    template().__type === 'Food'
                      ? 'FoodItem'
                      : 'RecipeItem' // TODO: Refactor conversion from template type to group/item types
                })}
                class="mt-1"
                onClick={() => {
                  props.setSelectedTemplate(template())
                  props.setFoodItemEditModalVisible(true)
                  props.setBarCodeModalVisible(false)
                }}
                header={
                  <FoodItemHeader
                    name={<FoodItemName />}
                    favorite={
                      <FoodItemFavorite
                        favorite={isFoodFavorite(template().id)}
                        onSetFavorite={(favorite) => { setFoodAsFavorite(template().id, favorite) }
                        }
                      />
                    }
                  />
                }
                nutritionalInfo={<FoodItemNutritionalInfo />}
              />
            </>
          )
        })}
        </For>
      </div>
    </>
  )
}
