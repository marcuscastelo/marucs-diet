import { Modal, ModalHeader } from '~/sections/common/components/Modal'
import {
  useModalContext,
  ModalContextProvider,
} from '~/sections/common/context/ModalContext'
import BarCodeInsertModal from '~/sections/barcode/components/BarCodeInsertModal'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import {
  type ItemGroup,
  type RecipedItemGroup,
  type SimpleItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { addId, generateId } from '~/legacy/utils/idUtils'
import { TemplateSearchTabs } from '~/sections/search/components/TemplateSearchTabs'
import { useTyping } from '~/sections/common/hooks/useTyping'
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
import { currentUser, currentUserId } from '~/modules/user/application/user'
import {
  type Accessor,
  Show,
  createSignal,
  type Setter,
  createResource,
  Suspense,
  createEffect,
  untrack,
} from 'solid-js'
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
import { TemplateSearchBar } from './TemplateSearchBar'
import { TemplateSearchResults } from './TemplateSearchResults'
import { BarCodeButton } from '~/sections/common/components/BarCodeButton'
import {
  templateSearch,
  setTemplateSearchTab,
  templateSearchTab,
  setTemplateSearch,
} from '~/modules/search/application/search'

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (
    group: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => void
  onFinish?: () => void
}

export function TemplateSearchModal(props: TemplateSearchModalProps) {
  const { visible, setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [itemEditModalVisible, setItemEditModalVisible] =
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
      console.log(`[TemplateSearchModal] isOverflow`)

      // TODO: Create Settings for MacroOverflow warnings
      // if (!macroOverflow().enable) {
      // return false
      // }

      const currentDayDiet_ = currentDayDiet()
      if (currentDayDiet_ === null) {
        console.error(
          '[TemplateSearchModal] currentDayDiet is undefined, cannot calculate overflow',
        )
        return false
      }

      const macroTarget_ = macroTarget(stringToDate(targetDay()))
      if (macroTarget_ === null) {
        console.error(
          '[TemplateSearchModal] macroTarget is undefined, cannot calculate overflow',
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
        `[TemplateSearchModal] ${property} difference:`,
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
              setItemEditModalVisible(false)
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
              setItemEditModalVisible(false)
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
                  itemEditModalVisible={itemEditModalVisible}
                  setItemEditModalVisible={setItemEditModalVisible}
                  setSelectedTemplate={setSelectedTemplate}
                  modalVisible={visible}
                />
              </Show>
            </div>
          }
        />
      </ModalContextProvider>
      <ExternalItemEditModal
        visible={itemEditModalVisible}
        setVisible={setItemEditModalVisible}
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
          setItemEditModalVisible(true)
          setBarCodeModalVisible(false)
        }}
      />
    </>
  )
}

const fetchFoodsForModal = async (): Promise<readonly Food[]> => {
  const getAllowedFoods = async () => {
    switch (templateSearchTab()) {
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
    templateSearchTab() === 'favorites'
      ? undefined // Show all favorites
      : 50 // Show 50 results

  const allowedFoods = await getAllowedFoods()
  console.debug('[TemplateSearchModal] fetchFunc', {
    tab: templateSearchTab(),
    search: templateSearch(),
    limit,
    allowedFoods,
  })

  let foods: readonly Food[]
  if (templateSearch() === '') {
    foods = await fetchFoods({ limit, allowedFoods })
  } else {
    foods = await fetchFoodsByName(templateSearch(), { limit, allowedFoods })
  }

  if (templateSearchTab() === 'recent') {
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
  if (templateSearch() === '') {
    return await fetchUserRecipes(currentUserId())
  } else {
    return await fetchUserRecipeByName(currentUserId(), templateSearch())
  }
}

const fetchFunc = async () => {
  const tab_ = templateSearchTab()
  if (tab_ !== 'recipes') {
    return await fetchFoodsForModal()
  } else if (tab_ === 'recipes') {
    return await fetchRecipes()
  } else {
    tab_ satisfies never
    throw new Error('BUG: Invalid tab selected: ' + templateSearchTab())
  }
}

export function TemplateSearch(props: {
  modalVisible: Accessor<boolean>
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
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
      search: !typing() && templateSearch(),
      tab: templateSearchTab(),
      userId: currentUserId(),
    }),
    fetchFunc,
  )

  createEffect(() => {
    templateSearch()
    untrack(onTyped)
  })

  createEffect(() => {
    props.modalVisible()
    setTemplateSearchTab('all')
  })

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

      <TemplateSearchTabs
        tab={templateSearchTab}
        setTab={setTemplateSearchTab}
      />
      <TemplateSearchBar isDesktop={isDesktop} />

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
        <TemplateSearchResults
          search={templateSearch()}
          filteredTemplates={templates() ?? []}
          barCodeModalVisible={props.barCodeModalVisible}
          setBarCodeModalVisible={props.setBarCodeModalVisible}
          itemEditModalVisible={props.itemEditModalVisible}
          setItemEditModalVisible={props.setItemEditModalVisible}
          setSelectedTemplate={props.setSelectedTemplate}
          typing={typing}
          refetch={refetch}
        />
      </Suspense>
    </>
  )
}

// TODO: Extract to components on other files
function ExternalItemEditModal(props: {
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
      <ItemEditModal
        targetName={props.targetName}
        item={() => ({
          reference: props.selectedTemplate().id,
          name: props.selectedTemplate().name,
          macros: props.selectedTemplate().macros,
          __type:
            props.selectedTemplate().__type === 'Food'
              ? 'Item'
              : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
        })}
        macroOverflow={() => ({
          enable: true,
        })}
        onApply={(item) => {
          // TODO: Refactor conversion from template type to group/item types
          if (item.__type === 'Item') {
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
