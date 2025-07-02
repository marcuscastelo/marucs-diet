import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
  Suspense,
} from 'solid-js'

import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { type Template } from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  isFoodItem,
  isRecipeItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  fetchRecentFoodByUserTypeAndReferenceId,
  insertRecentFood,
  updateRecentFood,
} from '~/modules/recent-food/application/recentFood'
import { createNewRecentFood } from '~/modules/recent-food/domain/recentFood'
import {
  debouncedSearch,
  refetchTemplates,
  setTemplateSearchTab,
  templates,
  templateSearchTab,
} from '~/modules/search/application/search'
import { showSuccess } from '~/modules/toast/application/toastManager'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { EANButton } from '~/sections/common/components/EANButton'
import { Modal } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { ExternalEANInsertModal } from '~/sections/search/components/ExternalEANInsertModal'
import { ExternalTemplateToUnifiedItemModal } from '~/sections/search/components/ExternalTemplateToUnifiedItemModal'
import { TemplateSearchBar } from '~/sections/search/components/TemplateSearchBar'
import { TemplateSearchResults } from '~/sections/search/components/TemplateSearchResults'
import {
  availableTabs,
  TemplateSearchTabs,
} from '~/sections/search/components/TemplateSearchTabs'
import { handleApiError } from '~/shared/error/errorHandler'
import { stringToDate } from '~/shared/utils/date'
import { isOverflow } from '~/shared/utils/macroOverflow'

const TEMPLATE_SEARCH_DEFAULT_TAB = availableTabs.Todos.id

export type TemplateSearchModalProps = {
  targetName: string
  onNewUnifiedItem?: (
    item: UnifiedItem,
    originalAddedItem: TemplateItem,
  ) => void
  onFinish?: () => void
}

export function TemplateSearchModal(props: TemplateSearchModalProps) {
  const { visible } = useModalContext()
  const { show: showConfirmModal, close: closeConfirmModal } =
    useConfirmModalContext()

  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)

  const [EANModalVisible, setEANModalVisible] = createSignal(false)

  const [selectedTemplate, setSelectedTemplate] = createSignal<
    Template | undefined
  >(undefined)

  const handleNewUnifiedItem = async (
    newItem: UnifiedItem,
    originalAddedItem: TemplateItem,
  ) => {
    // For UnifiedItem, we need to check macro overflow
    console.log(
      '[TemplateSearchModal] Setting up macro overflow checking for UnifiedItem',
    )

    const currentDayDiet_ = currentDayDiet()
    const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))

    // Create context object once
    const macroOverflowContext = {
      currentDayDiet: currentDayDiet_,
      macroTarget: macroTarget_,
      macroOverflowOptions: { enable: true },
    }

    // Helper function for checking individual macro properties on the unified item
    const checkMacroOverflow = (property: keyof MacroNutrients) => {
      return isOverflow(originalAddedItem, property, macroOverflowContext)
    }

    const onConfirm = async () => {
      props.onNewUnifiedItem?.(newItem, originalAddedItem)

      let type: 'food' | 'recipe'
      if (isFoodItem(originalAddedItem)) {
        type = 'food'
      } else if (isRecipeItem(originalAddedItem)) {
        type = 'recipe'
      } else {
        throw new Error('Invalid template item type')
      }

      const recentFood = await fetchRecentFoodByUserTypeAndReferenceId(
        currentUserId(),
        type,
        originalAddedItem.reference.id,
      )

      if (
        recentFood !== null &&
        (recentFood.user_id !== currentUserId() ||
          recentFood.type !== type ||
          recentFood.reference_id !== originalAddedItem.reference.id)
      ) {
        throw new Error(
          'BUG: recentFood fetched does not match user/type/reference',
        )
      }

      const newRecentFood = createNewRecentFood({
        ...(recentFood ?? {}),
        user_id: currentUserId(),
        type,
        reference_id: originalAddedItem.reference.id,
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
            preventAutoClose: true,
            onClick: () => {
              console.debug(
                '[TemplateSearchModal] Finalizar clicked - starting cleanup',
              )
              showSuccess(
                `Item "${originalAddedItem.name}" adicionado com sucesso!`,
              )
              // Immediately reset all modal state atomically to prevent race conditions
              console.debug(
                '[TemplateSearchModal] Resetting selectedTemplate and itemEditModalVisible',
              )
              setSelectedTemplate(undefined)
              setItemEditModalVisible(false)
              // Close the confirm modal manually since preventAutoClose is true
              console.debug('[TemplateSearchModal] Closing confirm modal')
              closeConfirmModal()
              // Call onFinish immediately to prevent race conditions
              console.debug('[TemplateSearchModal] Calling props.onFinish')
              props.onFinish?.()
            },
          },
        ],
        hasBackdrop: true, // Add backdrop to prevent clicks outside
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
                handleApiError(err)
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
        handleApiError(err)
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
                EANModalVisible={EANModalVisible}
                setEANModalVisible={setEANModalVisible}
                itemEditModalVisible={itemEditModalVisible}
                setItemEditModalVisible={setItemEditModalVisible}
                setSelectedTemplate={setSelectedTemplate}
                modalVisible={visible}
              />
            </Show>
          </div>
        </Modal.Content>
      </Modal>
      <Show when={selectedTemplate()}>
        {(selectedTemplate) => (
          <ExternalTemplateToUnifiedItemModal
            visible={itemEditModalVisible}
            setVisible={setItemEditModalVisible}
            selectedTemplate={selectedTemplate}
            targetName={props.targetName}
            onNewUnifiedItem={handleNewUnifiedItem}
          />
        )}
      </Show>
      <ExternalEANInsertModal
        visible={EANModalVisible}
        setVisible={setEANModalVisible}
        onSelect={(template) => {
          setSelectedTemplate(template)
          setItemEditModalVisible(true)
          setEANModalVisible(false)
        }}
      />
    </>
  )
}

export function TemplateSearch(props: {
  modalVisible: Accessor<boolean>
  EANModalVisible: Accessor<boolean>
  setEANModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  setSelectedTemplate: (food: Template | undefined) => void
}) {
  // TODO:   Determine if user is on desktop or mobile to set autofocus
  const isDesktop = false

  createEffect(() => {
    setTemplateSearchTab(
      props.modalVisible() ? TEMPLATE_SEARCH_DEFAULT_TAB : 'hidden',
    )
  })

  return (
    <>
      <div class="mb-2 flex gap-1 justify-end">
        <h3 class="text-md text-white my-auto w-full">
          Busca por nome ou código de barras
        </h3>
        <EANButton
          showEANModal={() => {
            console.debug('[TemplateSearchModal] showEANModal')
            props.setEANModalVisible(true)
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
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <PageLoading message="Carregando sistema de busca" />
          </div>
        }
      >
        <TemplateSearchResults
          search={debouncedSearch()}
          filteredTemplates={templates() ?? []}
          EANModalVisible={props.EANModalVisible}
          setEANModalVisible={props.setEANModalVisible}
          itemEditModalVisible={props.itemEditModalVisible}
          setItemEditModalVisible={props.setItemEditModalVisible}
          setSelectedTemplate={props.setSelectedTemplate}
          refetch={refetchTemplates}
        />
      </Suspense>
    </>
  )
}
