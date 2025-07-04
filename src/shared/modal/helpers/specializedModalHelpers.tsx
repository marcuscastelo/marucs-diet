/**
 * Specialized modal helper functions for common patterns in the application.
 * These functions encapsulate the most frequent modal usage patterns to reduce code duplication.
 */

import {
  RecipeEditModal,
  type RecipeEditModalProps,
} from '~/sections/recipe/components/RecipeEditModal'
import {
  TemplateSearchModal,
  type TemplateSearchModalProps,
} from '~/sections/search/components/TemplateSearchModal'
import {
  UnifiedItemEditModal,
  type UnifiedItemEditModalProps,
} from '~/sections/unified-item/components/UnifiedItemEditModal'
import {
  closeModal,
  openConfirmModal,
  openContentModal,
  openEditModal,
} from '~/shared/modal/helpers/modalHelpers'
import type { ModalId } from '~/shared/modal/types/modalTypes'

export type ModalController = {
  modalId: ModalId
  close: () => void
}

export type UnifiedItemEditModalConfig = UnifiedItemEditModalProps & {
  title?: string
  targetName?: string
}

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

export type TemplateSearchModalConfig = TemplateSearchModalProps & {
  title?: string
}

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

export type RecipeEditModalConfig = RecipeEditModalProps & {
  title?: string
}

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
  itemName: string
  itemType?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  title?: string
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

export type ClearItemsConfirmModalConfig = {
  context?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  title?: string
  message?: string
}

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
