import { Modal, ModalHeader } from '~/sections/common/components/Modal'
import {
  useModalContext,
  ModalContextProvider,
} from '~/sections/common/context/ModalContext'
import {
  FoodItemFavorite,
  FoodItemHeader,
  FoodItemName,
  FoodItemNutritionalInfo,
  FoodItemView,
} from '~/sections/food-item/components/FoodItemView'
import BarCodeInsertModal from '~/sections/barcode/components/BarCodeInsertModal'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { FoodItemEditModal } from '~/sections/food-item/components/FoodItemEditModal'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { addId, generateId } from '~/legacy/utils/idUtils'
import {
  type AvailableTab,
  TemplateSearchTabs,
} from '~/sections/search/components/TemplateSearchTabs'
import { useTyping } from '~/sections/common/hooks/useTyping'
import { createFoodItem } from '~/modules/diet/food-item/domain/foodItem'
import {
  fetchRecentFoodByUserIdAndFoodId,
  fetchUserRecentFoods,
  insertRecentFood,
  updateRecentFood,
} from '~/legacy/controllers/recentFood'
import { createRecentFood } from '~/modules/recent-food/domain/recentFood'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

import { type Food, createFood } from '~/modules/diet/food/domain/food'
import {
  currentUser,
  currentUserId,
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import {
  type Accessor,
  Show,
  createSignal,
  type Setter,
  For,
  createResource,
  Suspense,
  createEffect,
} from 'solid-js'
import { Alert } from '~/sections/common/components/Alert'
import { PageLoading } from '~/sections/common/components/PageLoading'
import {
  fetchUserRecipeByName,
  fetchUserRecipes,
} from '~/modules/diet/recipe/application/recipe'
import {
  fetchFoodById,
  fetchFoods,
  fetchFoodsByName,
} from '~/modules/diet/food/application/food'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { macroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import { stringToDate } from '~/legacy/utils/dateUtils'
import { calcDayMacros, calcItemMacros } from '~/legacy/utils/macroMath'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import toast from 'solid-toast'
import { BarCodeIcon } from '~/sections/common/components/icons/BarCodeIcon'

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (
    foodItem: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => void
  onFinish?: () => void
}

export function TemplateSearchModal(props: TemplateSearchModalProps) {
  const { visible, setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    createSignal(false)

  const [barCodeModalVisible, setBarCodeModalVisible] = createSignal(false)

  const [selectedTemplate, setSelectedTemplate] = createSignal<Template>(
    addId(createFood({ name: 'BUG: SELECTED TEMPLATE NOT SET' })), // TODO: Properly handle no template selected
  )

  const handleNewItemGroup = async (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => {
    // TODO: Move isOverflow to a specialized module
    const isOverflow = (property: keyof MacroNutrients) => {
      console.log(`[FoodItemNutritionalInfo] isOverflow`)

      // TODO: Create Settings for MacroOverflow warnings
      // if (!macroOverflow().enable) {
      // return false
      // }

      const currentDayDiet_ = currentDayDiet()
      if (currentDayDiet_ === null) {
        console.error(
          '[FoodItemNutritionalInfo] currentDayDiet is undefined, cannot calculate overflow',
        )
        return false
      }

      const macroTarget_ = macroTarget(stringToDate(targetDay()))
      if (macroTarget_ === null) {
        console.error(
          '[FoodItemNutritionalInfo] macroTarget is undefined, cannot calculate overflow',
        )
        return false
      }
      // Since it is an insertion there is no original item
      const originalItem_ = undefined

      // TODO: Support adding more than one item at a time?
      const itemMacros = calcItemMacros(newGroup.items[0])
      const originalItemMacros: MacroNutrients =
        originalItem_ !== undefined
          ? calcItemMacros(originalItem_)
          : {
              carbs: 0,
              protein: 0,
              fat: 0,
            }

      const difference =
        originalItem_ !== undefined
          ? itemMacros[property] - originalItemMacros[property]
          : itemMacros[property]

      const current = calcDayMacros(currentDayDiet_)[property]
      const target = macroTarget_[property]

      console.log(
        `[FoodItemNutritionalInfo] ${property} difference:`,
        difference,
      )

      return current + difference > target
    }

    const onConfirm = async () => {
      props.onNewItemGroup?.(newGroup, originalAddedItem)

      const recentFood = await fetchRecentFoodByUserIdAndFoodId(
        currentUserId(),
        originalAddedItem.reference,
      )

      if (
        recentFood !== null &&
        (recentFood.user_id !== currentUserId() ||
          recentFood.food_id !== originalAddedItem.reference)
      ) {
        // TODO: Remove recent food assertion once unit tests are in place
        throw new Error('BUG: recentFood fetched does not match user and food')
      }

      const newRecentFood = createRecentFood({
        ...recentFood,
        user_id: currentUserId(),
        food_id: originalAddedItem.reference,
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
            // TODO: Show toast "Item <nome> adicionado com sucesso"
            text: 'Adicionar mais um item',
            onClick: () => {
              // TODO: Remove createFood as default selected food
              setSelectedTemplate(
                addId(
                  createFood({
                    name: 'BUG: SELECTED FOOD NOT SET',
                  }),
                ),
              )
              setFoodItemEditModalVisible(false)
            },
          },
          {
            text: 'Finalizar',
            primary: true,
            onClick: () => {
              // TODO: Remove createFood as default selected food
              setSelectedTemplate(
                addId(
                  createFood({
                    name: 'BUG: SELECTED FOOD NOT SET',
                  }),
                ),
              )
              setFoodItemEditModalVisible(false)
              props.onFinish?.()
            },
          },
        ],
      })
    }

    const isOverflowing =
      isOverflow('carbs') || isOverflow('protein') || isOverflow('fat')

    if (isOverflowing) {
      // Prompt if user wants to add item even if it overflows
      showConfirmModal({
        title: 'Macros ultrapassam metas diárias',
        body: 'Os macros deste item ultrapassam as metas diárias. Deseja adicionar mesmo assim?',
        actions: [
          {
            text: 'Adicionar mesmo assim',
            primary: true,
            onClick: () => {
              onConfirm().catch((err) => {
                console.error(err)
                toast.error(
                  'Erro ao adicionar item: \n' + JSON.stringify(err, null, 2),
                )
              })
            },
          },
          {
            text: 'Cancelar',
            onClick: () => {
              // Do nothing
            },
          },
        ],
      })
    } else {
      try {
        await onConfirm()
      } catch (err) {
        console.error(err)
        toast.error('Erro ao adicionar item: \n' + JSON.stringify(err, null, 2))
      }
    }
  }

  console.debug('[TemplateSearchModal] Render')
  return (
    <>
      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          header={<ModalHeader title="Adicionar um novo alimento" />}
          body={
            <div class="max-h-full">
              <Show when={visible}>
                <TemplateSearch
                  barCodeModalVisible={barCodeModalVisible}
                  setBarCodeModalVisible={setBarCodeModalVisible}
                  foodItemEditModalVisible={foodItemEditModalVisible}
                  setFoodItemEditModalVisible={setFoodItemEditModalVisible}
                  setSelectedTemplate={setSelectedTemplate}
                  modalVisible={visible}
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
          setBarCodeModalVisible(false)
        }}
      />
    </>
  )
}

const [search, setSearch_] = createSignal<string>('')
const [tab, setTab] = createSignal<AvailableTab>('all')

const fetchFoodsForModal = async (): Promise<readonly Food[]> => {
  const getAllowedFoods = async () => {
    switch (tab()) {
      case 'favorites':
        return currentUser()?.favorite_foods ?? []
      case 'recent':
        return (await fetchUserRecentFoods(currentUserId())).map(
          (food) => food.food_id,
        )
      default:
        return undefined // Allow any food
    }
  }

  const limit =
    tab() === 'favorites'
      ? undefined // Show all favorites
      : 50 // Show 50 results

  const allowedFoods = await getAllowedFoods()
  console.debug('[TemplateSearchModal] fetchFunc', {
    tab: tab(),
    search: search(),
    limit,
    allowedFoods,
  })

  let foods: readonly Food[]
  if (search() === '') {
    foods = await fetchFoods({ limit, allowedFoods })
  } else {
    foods = await fetchFoodsByName(search(), { limit, allowedFoods })
  }

  if (tab() === 'recent') {
    foods = (
      await Promise.all(
        allowedFoods?.map(async (foodId) => {
          let food: Food | null = null
          const alreadyFechedFood = foods.find((food) => food.id === foodId)
          if (alreadyFechedFood === undefined) {
            console.debug(
              `[TemplateSearchModal] Food is not already fetched: ${foodId}`,
            )
            food = await fetchFoodById(foodId)
          } else {
            console.debug(
              `[TemplateSearchModal] Food is already fetched: ${foodId}`,
            )
            food = alreadyFechedFood
          }
          return food
        }) ?? [],
      )
    ).filter((food) => food !== null)
  }
  return foods
}

const fetchRecipes = async (): Promise<readonly Recipe[]> => {
  if (search() === '') {
    return await fetchUserRecipes(currentUserId())
  } else {
    return await fetchUserRecipeByName(currentUserId(), search())
  }
}

const fetchFunc = async () => {
  const tab_ = tab()
  if (tab_ !== 'recipes') {
    return await fetchFoodsForModal()
  } else if (tab_ === 'recipes') {
    return await fetchRecipes()
  } else {
    tab_ satisfies never
    throw new Error('BUG: Invalid tab selected: ' + tab())
  }
}

export function TemplateSearch(props: {
  modalVisible: Accessor<boolean>
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
  setSelectedTemplate: (food: Template) => void
}) {
  const TYPING_TIMEOUT_MS = 2000

  // TODO: Determine if user is on desktop or mobile to set autofocus
  const isDesktop = false

  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch()
    }, // TODO: Change 'all' to selected tab
  })

  const [templates, { refetch }] = createResource(
    () => ({
      search: !typing() && search(),
      tab: tab(),
      userId: currentUserId(),
    }),
    fetchFunc,
  )

  const setSearch = (newSearch: string) => {
    setSearch_(newSearch)
    onTyped()
  }

  createEffect(() => {
    props.modalVisible()
    setTab('all')
  })

  // TODO: Create DEFAULT_TAB constant
  // const searchFilteredTemplates = () =>
  //   (loadedTemplatesOrNull() ?? [])
  //     .filter((template) => {
  //       if (search() === '') {
  //         return true
  //       }

  //       // Fuzzy search
  //       const searchLower = search().toLowerCase()
  //       const nameLower = template.name.toLowerCase()
  //       const searchWords = searchLower.split(' ')
  //       const nameWords = nameLower.split(' ')

  //       for (const searchWord of searchWords) {
  //         let found = false
  //         for (const nameWord of nameWords) {
  //           if (nameWord.startsWith(searchWord)) {
  //             found = true
  //             break
  //           }
  //         }

  //         if (!found) {
  //           return false
  //         }
  //       }

  //       return true
  //     })
  //     .slice(0, TEMPLATE_SEARCH_LIMIT)

  return (
    <>
      <div class="mb-2 flex justify-end">
        <h3 class="text-md text-white my-auto w-full">
          Busca por nome ou código de barras
        </h3>
        <BarCodeButton
          showBarCodeModal={() => {
            console.debug('[TemplateSearchModal] showBarCodeModal')
            props.setBarCodeModalVisible(true)
          }}
        />
      </div>

      <TemplateSearchTabs tab={tab} setTab={setTab} />
      <SearchBar
        isDesktop={isDesktop}
        search={search()}
        onSetSearch={setSearch}
      />

      <Show when={typing()}>
        <>...</>
      </Show>

      <Suspense
        fallback={
          <PageLoading
            message={`Status: ${templates.state}: ${templates.error}`}
          />
        }
      >
        <SearchResults
          search={search()}
          filteredTemplates={templates() ?? []}
          barCodeModalVisible={props.barCodeModalVisible}
          setBarCodeModalVisible={props.setBarCodeModalVisible}
          foodItemEditModalVisible={props.foodItemEditModalVisible}
          setFoodItemEditModalVisible={props.setFoodItemEditModalVisible}
          setSelectedTemplate={props.setSelectedTemplate}
          typing={typing}
        />
      </Suspense>
    </>
  )
}

// TODO: Extract to components on other files
const BarCodeButton = (props: { showBarCodeModal: () => void }) => (
  <>
    <button
      // TODO: Add BarCode icon instead of text
      onClick={() => {
        props.showBarCodeModal()
      }}
      class="rounded bg-gray-800 font-bold text-white hover:bg-gray-700 w-16 p-2 hover:scale-110 transition-transform"
    >
      <BarCodeIcon />
    </button>
  </>
)

// TODO: Extract to components on other files
function ExternalFoodItemEditModal(props: {
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
              : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
        })}
        macroOverflow={() => ({
          enable: true,
        })}
        onApply={(item) => {
          // TODO: Refactor conversion from template type to group/item types
          if (item.__type === 'FoodItem') {
            const newGroup: SimpleItemGroup = {
              id: generateId(),
              name: item.name,
              items: [item],
              type: 'simple',
              quantity: item.quantity,
            }
            props.onNewItemGroup(newGroup, item).catch((err) => {
              console.error(err)
              toast.error(
                'Erro ao adicionar item: \n' + JSON.stringify(err, null, 2),
              )
            })
          } else {
            const newGroup: RecipedItemGroup = {
              id: generateId(),
              name: item.name,
              items: [...(props.selectedTemplate() as Recipe).items],
              type: 'recipe',
              quantity: item.quantity, // TODO: Implement quantity on recipe item groups (should influence macros)
              recipe: (props.selectedTemplate() as Recipe).id,
            }
            props.onNewItemGroup(newGroup, item).catch((err) => {
              console.error(err)
              toast.error(
                'Erro ao adicionar item: \n' + JSON.stringify(err, null, 2),
              )
            })
          }
        }}
      />
    </ModalContextProvider>
  )
}

// TODO: Extract to components on other files
function ExternalBarCodeInsertModal(props: {
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
      onInput={(e) => {
        props.onSetSearch(e.target.value)
      }}
      type="search"
      id="default-search"
      class="block w-full border-gray-600 bg-gray-700 px-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 hover:border-white transition-transform"
      placeholder="Buscar alimentos"
      required
    />
  </div>
)

// TODO: Extract to components on other files
const SearchResults = (props: {
  search: string
  typing: Accessor<boolean>
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (food: Template) => void
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
}) => {
  return (
    <>
      {!props.typing() && props.filteredTemplates.length === 0 && (
        <Alert color="yellow" class="mt-2">
          Nenhum alimento encontrado para a busca &quot;{props.search}&quot;.
        </Alert>
      )}

      <div class="bg-gray-800 p-1">
        <For each={props.filteredTemplates}>
          {(_, idx) => {
            const template = () => props.filteredTemplates[idx()]
            return (
              <>
                <FoodItemView
                  foodItem={() => ({
                    ...createFoodItem({
                      name: template().name,
                      quantity: 100,
                      macros: template().macros,
                      reference: template().id,
                    }),
                    __type:
                      template().__type === 'Food' ? 'FoodItem' : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
                  })}
                  class="mt-1"
                  macroOverflow={() => ({
                    enable: false,
                  })}
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
                          onSetFavorite={(favorite) => {
                            setFoodAsFavorite(template().id, favorite)
                          }}
                        />
                      }
                    />
                  }
                  nutritionalInfo={<FoodItemNutritionalInfo />}
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
