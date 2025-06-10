import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
  Suspense,
  untrack,
} from 'solid-js'

import { isOverflowForItemGroup } from '~/legacy/utils/macroOverflow'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
} from '~/modules/diet/template-item/domain/templateItem'
import {
  fetchRecentFoodByUserTypeAndReferenceId,
  insertRecentFood,
  updateRecentFood,
} from '~/modules/recent-food/application/recentFood'
import { createNewRecentFood } from '~/modules/recent-food/domain/recentFood'
import {
  refetchTemplates,
  setDebouncedSearch,
  setTemplateSearchTab,
  templates,
  templateSearch,
  templateSearchTab,
} from '~/modules/search/application/search'
import { showSuccess } from '~/modules/toast/application/toastManager'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { BarCodeButton } from '~/sections/common/components/BarCodeButton'
import { Modal } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useTyping } from '~/sections/common/hooks/useTyping'
import { ExternalBarCodeInsertModal } from '~/sections/search/components/ExternalBarCodeInsertModal'
import { ExternalTemplateToItemGroupModal } from '~/sections/search/components/ExternalTemplateToItemGroupModal'
import { TemplateSearchBar } from '~/sections/search/components/TemplateSearchBar'
import { TemplateSearchResults } from '~/sections/search/components/TemplateSearchResults'
import {
  availableTabs,
  TemplateSearchTabs,
} from '~/sections/search/components/TemplateSearchTabs'
import { handleApiError } from '~/shared/error/errorHandler'
import { stringToDate } from '~/shared/utils/date'

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

      let type: 'food' | 'recipe'
      if (isTemplateItemFood(originalAddedItem)) {
        type = 'food'
      } else if (isTemplateItemRecipe(originalAddedItem)) {
        type = 'recipe'
      } else {
        throw new Error('Invalid template item type')
      }

      const recentFood = await fetchRecentFoodByUserTypeAndReferenceId(
        currentUserId(),
        type,
        originalAddedItem.reference,
      )

      if (
        recentFood !== null &&
        (recentFood.user_id !== currentUserId() ||
          recentFood.type !== type ||
          recentFood.reference_id !== originalAddedItem.reference)
      ) {
        throw new Error(
          'BUG: recentFood fetched does not match user/type/reference',
        )
      }

      const newRecentFood = createNewRecentFood({
        ...(recentFood ?? {}),
        user_id: currentUserId(),
        type,
        reference_id: originalAddedItem.reference,
      })

      if (recentFood !== null) {
        await updateRecentFood(recentFood.id, newRecentFood)
      } else {
        await insertRecentFood(newRecentFood)
      }

      showConfirmModal({
        title: 'Item adicionado com sucesso',
        body: 'Deseja adicionar outro item ou finalizar a inclusão?',
        actions: [
          {
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
                showError(err, {}, 'Erro ao adicionar item')
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
        showError(err, {}, 'Erro ao adicionar item')
      }
    }
  }

  console.debug('[TemplateSearchModal] Render')
  return (
    <>
      <Modal>
        <Modal.Header title="Adicionar um novo alimento" />
        <Modal.Content>
          <div class="flex flex-col h-[60vh] sm:h-[80vh] p-2">
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

  const { typing, onTyped } = useTyping({
    delay: TYPING_TIMEOUT_MS,
    onTypingEnd: () => {
      setDebouncedSearch(templateSearch())
      console.debug(`[TemplateSearchModal] onTyped called`)
      void refetchTemplates()
    },
  })

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
      <div class="mb-2 flex gap-1 justify-end">
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
          refetch={refetchTemplates}
        />
      </Suspense>
    </>
  )
}
