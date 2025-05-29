import { Modal, ModalHeader } from '~/sections/common/components/Modal'
import {
  useModalContext,
  ModalContextProvider,
} from '~/sections/common/context/ModalContext'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { addId } from '~/legacy/utils/idUtils'
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
import { handleApiError } from '~/shared/error/errorHandler'
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
import { isOverflowForItemGroup } from '~/legacy/utils/macroOverflow'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import toast from 'solid-toast'
import { TemplateSearchBar } from './TemplateSearchBar'
import { TemplateSearchResults } from './TemplateSearchResults'
import { BarCodeButton } from '~/sections/common/components/BarCodeButton'
import {
  templateSearch,
  setTemplateSearchTab,
  templateSearchTab,
} from '~/modules/search/application/search'
import { formatError } from '~/shared/formatError'
import { ExternalTemplateToItemGroupModal } from './ExternalTemplateToItemGroupModal'
import { ExternalBarCodeInsertModal } from './ExternalBarCodeInsertModal'

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
    // Use specialized macro overflow checker with context
    console.log(`[TemplateSearchModal] Setting up macro overflow checking`)
    
    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = macroTarget(stringToDate(targetDay()))
    
    // Create context object once
    const macroOverflowContext = {
      currentDayDiet: currentDayDiet_,
      macroTarget: macroTarget_,
      macroOverflowOptions: { enable: true } // Since it's an insertion, no original item
    }
    
    // Helper function for checking individual macro properties
    const checkMacroOverflow = (property: keyof MacroNutrients) => {
      return isOverflowForItemGroup(newGroup.items, property, macroOverflowContext)
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

    // Check if any macro nutrient would overflow
    const isOverflowing =
      checkMacroOverflow('carbs') || 
      checkMacroOverflow('protein') || 
      checkMacroOverflow('fat')

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
                handleApiError(err, {
                  component: 'TemplateSearchModal',
                  operation: 'confirmOverMacros',
                  additionalData: { templateType: 'item' }
                })
                toast.error(
                  `Erro ao adicionar item: ${formatError(err)}`,
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
        handleApiError(err, {
          component: 'TemplateSearchModal',
          operation: 'confirmItem',
          additionalData: { templateType: 'item' }
        })
        toast.error(`Erro ao adicionar item: ${formatError(err)}`)
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
      <ExternalTemplateToItemGroupModal
        visible={itemEditModalVisible}
        setVisible={setItemEditModalVisible}
        selectedTemplate={selectedTemplate}
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
          refetch={async () => { await refetch(); }}
        />
      </Suspense>
    </>
  )
}
