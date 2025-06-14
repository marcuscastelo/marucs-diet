import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
  Suspense,
  untrack,
} from 'solid-js'

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
  templates,
  templateSearch,
  templateSearchTab,
} from '~/modules/search/application/search'
import { setTemplateSearchTab } from '~/modules/search/application/search'
import { showSuccess } from '~/modules/toast/application/toastManager'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { EANButton } from '~/sections/common/components/EANButton'
import { Modal } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useTyping } from '~/sections/common/hooks/useTyping'
import { ExternalEANInsertModal } from '~/sections/search/components/ExternalEANInsertModal'
import { ExternalTemplateToItemGroupModal } from '~/sections/search/components/ExternalTemplateToItemGroupModal'
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
  onNewItemGroup?: (group: ItemGroup, originalAddedItem: TemplateItem) => void
  onFinish?: () => void
}

export function TemplateSearchModal(props: TemplateSearchModalProps) {
  const { visible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)

  const [EANModalVisible, setEANModalVisible] = createSignal(false)

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
      if (!Array.isArray(newGroup.items)) return false
      return newGroup.items.some((item) =>
        isOverflow(item, property, macroOverflowContext),
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
      <Show when={selectedTemplate() !== undefined}>
        <ExternalTemplateToItemGroupModal
          visible={itemEditModalVisible}
          setVisible={setItemEditModalVisible}
          selectedTemplate={() => selectedTemplate() as Template}
          targetName={props.targetName}
          onNewItemGroup={handleNewItemGroup}
        />
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
        setTab={(tab) => {
          if (typeof tab === 'string') setTemplateSearchTab(tab)
        }}
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
          EANModalVisible={props.EANModalVisible}
          setEANModalVisible={props.setEANModalVisible}
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
