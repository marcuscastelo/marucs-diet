/**
 * Specialized modal helper functions for common patterns in the application.
 * These functions encapsulate the most frequent modal usage patterns to reduce code duplication.
 */

import type { Accessor } from 'solid-js'

import type { Recipe } from '~/modules/diet/recipe/domain/recipe'
import type { TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import type { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { RecipeEditModal } from '~/sections/recipe/components/RecipeEditModal'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import {
  closeModal,
  openConfirmModal,
  openContentModal,
  openEditModal,
} from '~/shared/modal/helpers/modalHelpers'
import type { ModalId } from '~/shared/modal/types/modalTypes'

/**
 * Modal controller interface for consistent modal management.
 */
export type ModalController = {
  /** The modal ID for tracking */
  modalId: ModalId
  /** Close this specific modal */
  close: () => void
}

/**
 * Configuration for UnifiedItemEditModal
 */
export type UnifiedItemEditModalConfig = {
  /** Target meal name (e.g., "Café da manhã") */
  targetMealName: string
  /** Target name color for nested editing contexts */
  targetNameColor?: string
  /** Item accessor */
  item: Accessor<UnifiedItem>
  /** Macro overflow configuration */
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
  /** Called when user applies changes */
  onApply: (item: UnifiedItem) => void
  /** Called when user cancels */
  onCancel?: () => void
  /** Called when modal should close */
  onClose?: () => void
  /** Custom title override */
  title?: string
  /** Target name for title context */
  targetName?: string
  /** Whether to show add item button */
  showAddItemButton?: boolean
  /** Called when user wants to add new item */
  onAddNewItem?: () => void
}

/**
 * Opens a UnifiedItemEditModal with standardized configuration.
 */
export function openUnifiedItemEditModal(
  config: UnifiedItemEditModalConfig,
): ModalController {
  const title = config.title ?? 'Editar Item'

  let controller: ModalController

  const modalId = openEditModal(
    () => (
      <UnifiedItemEditModal
        targetMealName={config.targetMealName}
        targetNameColor={config.targetNameColor}
        item={config.item}
        macroOverflow={config.macroOverflow}
        onApply={(item) => {
          config.onApply(item)
          controller.close()
        }}
        onCancel={() => {
          config.onCancel?.()
          controller.close()
        }}
        onClose={() => {
          config.onClose?.()
          controller.close()
        }}
        showAddItemButton={config.showAddItemButton}
        onAddNewItem={config.onAddNewItem}
      />
    ),
    {
      title,
      targetName: config.targetName,
      onClose: () => {
        config.onClose?.()
      },
    },
  )

  controller = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for TemplateSearchModal
 */
export type TemplateSearchModalConfig = {
  /** Target name for context (e.g., meal name) */
  targetName: string
  /** Called when user adds a new unified item */
  onNewUnifiedItem?: (
    item: UnifiedItem,
    originalAddedItem: TemplateItem,
  ) => void
  /** Called when user finishes adding items */
  onFinish?: () => void
  /** Called when modal should close */
  onClose?: () => void
  /** Custom title override */
  title?: string
}

/**
 * Opens a TemplateSearchModal with standardized configuration.
 */
export function openTemplateSearchModal(
  config: TemplateSearchModalConfig,
): ModalController {
  const title = config.title ?? `Adicionar item - ${config.targetName}`

  let controller: ModalController

  const modalId = openContentModal(
    () => (
      <TemplateSearchModal
        targetName={config.targetName}
        onNewUnifiedItem={config.onNewUnifiedItem}
        onFinish={() => {
          config.onFinish?.()
          controller.close()
        }}
        onClose={() => {
          config.onClose?.()
          controller.close()
        }}
      />
    ),
    {
      title,
      onClose: () => {
        config.onClose?.()
      },
    },
  )

  controller = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for RecipeEditModal
 */
export type RecipeEditModalConfig = {
  /** Recipe accessor */
  recipe: Accessor<Recipe>
  /** Called when user saves the recipe */
  onSaveRecipe: (recipe: Recipe) => void
  /** Called to refetch data */
  onRefetch: () => void
  /** Called when user cancels */
  onCancel?: () => void
  /** Called when user deletes the recipe */
  onDelete: (recipeId: Recipe['id']) => void
  /** Called when modal should close */
  onClose?: () => void
  /** Custom title override */
  title?: string
}

/**
 * Opens a RecipeEditModal with standardized configuration.
 */
export function openRecipeEditModal(
  config: RecipeEditModalConfig,
): ModalController {
  const title = config.title ?? `Editar receita - ${config.recipe().name}`

  let controller: ModalController

  const modalId = openEditModal(
    () => (
      <RecipeEditModal
        recipe={config.recipe}
        onSaveRecipe={(recipe) => {
          config.onSaveRecipe(recipe)
          controller.close()
        }}
        onRefetch={config.onRefetch}
        onCancel={() => {
          config.onCancel?.()
          controller.close()
        }}
        onDelete={(recipeId) => {
          config.onDelete(recipeId)
          controller.close()
        }}
        onClose={() => {
          config.onClose?.()
          controller.close()
        }}
      />
    ),
    {
      title,
      onClose: () => {
        config.onClose?.()
      },
    },
  )

  controller = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for delete confirmation modals
 */
export type DeleteConfirmModalConfig = {
  /** Name of the item being deleted */
  itemName: string
  /** Type of item (e.g., "item", "receita", "dia") */
  itemType?: string
  /** Called when user confirms deletion */
  onConfirm: () => void | Promise<void>
  /** Called when user cancels */
  onCancel?: () => void
  /** Custom title override */
  title?: string
  /** Custom message override */
  message?: string
}

/**
 * Opens a standardized delete confirmation modal.
 */
export function openDeleteConfirmModal(
  config: DeleteConfirmModalConfig,
): ModalController {
  const itemType = config.itemType ?? 'item'
  const title = config.title ?? `Excluir ${itemType}`
  const message =
    config.message ??
    `Tem certeza que deseja excluir ${itemType === 'item' ? 'o item' : itemType === 'receita' ? 'a receita' : `o ${itemType}`} "${config.itemName}"?`

  const modalId = openConfirmModal(message, {
    title,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      await config.onConfirm()
    },
    onCancel: () => {
      config.onCancel?.()
    },
  })

  const controller: ModalController = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for macro overflow confirmation modals
 */
export type MacroOverflowConfirmModalConfig = {
  /** Called when user confirms adding despite overflow */
  onConfirm: () => void | Promise<void>
  /** Called when user cancels */
  onCancel?: () => void
  /** Custom title override */
  title?: string
  /** Custom message override */
  message?: string
}

/**
 * Opens a standardized macro overflow confirmation modal.
 */
export function openMacroOverflowConfirmModal(
  config: MacroOverflowConfirmModalConfig,
): ModalController {
  const title = config.title ?? 'Macros ultrapassam metas diárias'
  const message =
    config.message ??
    'Os macros deste item ultrapassam as metas diárias. Deseja adicionar mesmo assim?'

  const modalId = openConfirmModal(message, {
    title,
    confirmText: 'Adicionar mesmo assim',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      await config.onConfirm()
    },
    onCancel: () => {
      config.onCancel?.()
    },
  })

  const controller: ModalController = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for clear items confirmation modals
 */
export type ClearItemsConfirmModalConfig = {
  /** Context of what's being cleared (e.g., "os itens", "a receita") */
  context?: string
  /** Called when user confirms clearing */
  onConfirm: () => void | Promise<void>
  /** Called when user cancels */
  onCancel?: () => void
  /** Custom title override */
  title?: string
  /** Custom message override */
  message?: string
}

/**
 * Opens a standardized clear items confirmation modal.
 */
export function openClearItemsConfirmModal(
  config: ClearItemsConfirmModalConfig,
): ModalController {
  const context = config.context ?? 'os itens'
  const title = config.title ?? 'Limpar itens'
  const message = config.message ?? `Tem certeza que deseja limpar ${context}?`

  const modalId = openConfirmModal(message, {
    title,
    confirmText: 'Limpar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      await config.onConfirm()
    },
    onCancel: () => {
      config.onCancel?.()
    },
  })

  const controller: ModalController = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}

/**
 * Configuration for success/continuation modals
 */
export type SuccessContinueModalConfig = {
  /** Name of the item that was processed */
  itemName: string
  /** Action that was performed (e.g., "adicionado", "atualizado") */
  action?: string
  /** Called when user chooses to finish */
  onFinish: () => void
  /** Called when user chooses to continue */
  onContinue?: () => void
  /** Custom title override */
  title?: string
  /** Custom message override */
  message?: string
}

/**
 * Opens a standardized success/continuation modal.
 */
export function openSuccessContinueModal(
  config: SuccessContinueModalConfig,
): ModalController {
  const action = config.action ?? 'adicionado'
  const title = config.title ?? `Item ${action} com sucesso`
  const message =
    config.message ?? 'Deseja adicionar outro item ou finalizar a inclusão?'

  const modalId = openConfirmModal(message, {
    title,
    confirmText: 'Finalizar',
    cancelText: 'Adicionar mais um item',
    onConfirm: () => {
      config.onFinish()
    },
    onCancel: () => {
      config.onContinue?.()
    },
  })

  const controller: ModalController = {
    modalId,
    close: () => closeModal(modalId),
  }

  return controller
}
