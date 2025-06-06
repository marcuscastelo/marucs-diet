import {
  fetchRecentFoodByUserIdAndFoodId,
  fetchUserRecentFoods,
  insertRecentFood,
  updateRecentFood,
} from '~/modules/recent-food/application/recentFood'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { type Template } from '~/modules/diet/template/domain/template'
import { createNewRecentFood } from '~/modules/recent-food/domain/recentFood'
import { showSuccess } from '~/modules/toast/application/toastManager'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useTyping } from '~/sections/common/hooks/useTyping'
import {
  TemplateSearchTabs,
  availableTabs,
} from '~/sections/search/components/TemplateSearchTabs'
import { handleApiError } from '~/shared/error/errorHandler'

import {
  type Accessor,
  type Setter,
  Show,
  Suspense,
  createEffect,
  createResource,
  createSignal,
  untrack,
} from 'solid-js'
import { isOverflowForItemGroup } from '~/legacy/utils/macroOverflow'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  fetchFoodById,
  fetchFoods,
  fetchFoodsByName,
} from '~/modules/diet/food/application/food'
import { type Food } from '~/modules/diet/food/domain/food'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import {
  fetchUserRecipeByName,
  fetchUserRecipes,
} from '~/modules/diet/recipe/application/recipe'
import {
  setTemplateSearchTab,
  templateSearch,
  templateSearchTab,
} from '~/modules/search/application/search'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import { BarCodeButton } from '~/sections/common/components/BarCodeButton'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { formatError } from '~/shared/formatError'
import { stringToDate } from '~/shared/utils/date'
import { ExternalBarCodeInsertModal } from './ExternalBarCodeInsertModal'
import { ExternalTemplateToItemGroupModal } from './ExternalTemplateToItemGroupModal'
import { TemplateSearchBar } from './TemplateSearchBar'
import { TemplateSearchResults } from './TemplateSearchResults'

const TEMPLATE_SEARCH_DEFAULT_TAB = availableTabs.Todos.id

export type TemplateSearchModalProps = {
  targetName: string
  onNewItemGroup?: (group: ItemGroup, originalAddedItem: TemplateItem) => void
  onFinish?: () => void
}

export function TemplateSearchModal(props: TemplateSearchModalProps) {
  const { visible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)

  const [barCodeModalVisible, setBarCodeModalVisible] = createSignal(false)

  const [selectedTemplate, setSelectedTemplate] = createSignal<
    Template | undefined
  >(undefined)

  const handleNewItemGroup = async (
    newGroup: ItemGroup,
    originalAddedItem: TemplateItem,
  ) => {
    // Use specialized macro overflow checker with context
    console.log(`[TemplateSearchModal] Setting up macro overflow checking`)

    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))

    // Create context object once
    const macroOverflowContext = {
      currentDayDiet: currentDayDiet_,
      macroTarget: macroTarget_,
      macroOverflowOptions: { enable: true }, // Since it's an insertion, no original item
    }

    // Helper function for checking individual macro properties
    const checkMacroOverflow = (property: keyof MacroNutrients) => {
      return isOverflowForItemGroup(
        newGroup.items,
        property,
        macroOverflowContext,
      )
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
        // TODO:   Remove recent food assertion once unit tests are in place
        throw new Error('BUG: recentFood fetched does not match user and food')
      }

      const newRecentFood = createNewRecentFood({
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
      // TODO:   Show Yes/No instead of Ok/Cancel on modal
      showConfirmModal({
        title: 'Item adicionado com sucesso',
        body: 'Deseja adicionar outro item ou finalizar a inclusão?',
        actions: [
          {
            // Show success toast when adding more items
            text: 'Adicionar mais um item',
            onClick: () => {
              showSuccess(
                `Item "${originalAddedItem.name}" adicionado com sucesso!`,
              )
              setSelectedTemplate(undefined)
              setItemEditModalVisible(false)
            },
          },
          {
            text: 'Finalizar',
            primary: true,
            onClick: () => {
              showSuccess(
                `Item "${originalAddedItem.name}" adicionado com sucesso!`,
              )
              setSelectedTemplate(undefined)
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
                  additionalData: { templateType: 'item' },
                })
                showError(`Erro ao adicionar item: ${formatError(err)}`)
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
          additionalData: { templateType: 'item' },
        })
        showError(`Erro ao adicionar item: ${formatError(err)}`)
      }
    }
  }

  console.debug('[TemplateSearchModal] Render')
  return (
    <>
      <Modal>
        <Modal.Header title="Adicionar um novo alimento" />
        <Modal.Content>
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
        </Modal.Content>
      </Modal>
      <Show when={selectedTemplate() !== undefined}>
        <ExternalTemplateToItemGroupModal
          visible={itemEditModalVisible}
          setVisible={setItemEditModalVisible}
          selectedTemplate={() => selectedTemplate() as Template}
          targetName={props.targetName}
          onNewItemGroup={handleNewItemGroup}
        />
      </Show>
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
    ).filter((food): food is Food => food !== null)
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
  switch (tab_) {
    case 'recipes':
      return await fetchRecipes()
    default:
      return await fetchFoodsForModal()
  }
}

export function TemplateSearch(props: {
  modalVisible: Accessor<boolean>
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  setSelectedTemplate: (food: Template | undefined) => void
}) {
  const TYPING_TIMEOUT_MS = 2000

  // TODO:   Determine if user is on desktop or mobile to set autofocus
  const isDesktop = false

  const [debouncedSearch, setDebouncedSearch] = createSignal(templateSearch())

  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => {
      setDebouncedSearch(templateSearch())
      console.debug(`[TemplateSearchModal] onTyped called`)
      void refetch()
    },
  })

  const [templates, { refetch }] = createResource(
    () => ({
      search: debouncedSearch(),
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
    setTemplateSearchTab(TEMPLATE_SEARCH_DEFAULT_TAB)
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
          // eslint-disable-next-line solid/reactivity
          refetch={async () => {
            await refetch()
          }}
        />
      </Suspense>
    </>
  )
}
