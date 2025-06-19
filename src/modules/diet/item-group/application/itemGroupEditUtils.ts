import { type Accessor } from 'solid-js'

import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  updateUnifiedItemMacros,
  updateUnifiedItemQuantity,
} from '~/modules/diet/item/application/item'
import { isSimpleSingleGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemToGroup,
  removeItemFromGroup,
  updateItemInGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import {
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { createDebug } from '~/shared/utils/createDebug'
import { stringToDate } from '~/shared/utils/date'
import { isOverflow } from '~/shared/utils/macroOverflow'

const debug = createDebug()

/**
 * @deprecated Use handleNewUnifiedItem instead when working with unified items
 */
export function handleNewItemGroup({
  group,
  setGroup,
}: {
  group: Accessor<ItemGroup>
  setGroup: (g: ItemGroup) => void
}) {
  debug('handleNewItemGroup called', { group: group() })
  return (newGroup: ItemGroup) => {
    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Implement complex group support
      showError(
        'Grupos complexos ainda não são suportados, funcionalidade em desenvolvimento',
      )
      return
    }
    const newItem = newGroup.items[0]
    if (newItem === undefined) {
      showError('Grupo vazio, não é possível adicionar grupo vazio', {
        audience: 'system',
      })
      return
    }
    setGroup(addItemToGroup(group(), newItem))
  }
}

export function handleItemApply({
  group,
  persistentGroup,
  setGroup,
  setEditSelection,
  showConfirmModal,
}: {
  group: Accessor<ItemGroup>
  persistentGroup: Accessor<ItemGroup>
  setGroup: (g: ItemGroup) => void
  setEditSelection: (sel: null) => void
  showConfirmModal: (opts: {
    title: string
    body: string
    actions: Array<{
      text: string
      onClick: () => void
      primary?: boolean
    }>
  }) => void
}) {
  debug('handleItemApply called', {
    group: group(),
    persistentGroup: persistentGroup(),
  })
  return (item: TemplateItem) => {
    if (isTemplateItemRecipe(item)) {
      // TODO: Allow user to edit recipe
      showError(
        'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
      )
      return
    }
    function checkOverflow(property: keyof MacroNutrients) {
      const currentItem = item
      const originalItem = persistentGroup().items.find(
        (i) => i.id === currentItem.id,
      )
      if (!originalItem) {
        showError('Item original não encontrado', { audience: 'system' })
        return false
      }
      const currentDayDiet_ = currentDayDiet()
      const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))
      return isOverflow(item, property, {
        currentDayDiet: currentDayDiet_,
        macroTarget: macroTarget_,
        macroOverflowOptions: { enable: true, originalItem },
      })
    }
    const isOverflowing =
      checkOverflow('carbs') || checkOverflow('protein') || checkOverflow('fat')
    const onConfirm = () => {
      setGroup(updateItemInGroup(group(), item.id, item))
      setEditSelection(null)
    }
    if (isOverflowing) {
      showConfirmModal({
        title: 'Macronutrientes excedem metas diárias',
        body: 'Os macronutrientes desse item excedem as metas diárias. Deseja continuar mesmo assim?',
        actions: [
          { text: 'Cancelar', onClick: () => undefined },
          { text: 'Continuar', primary: true, onClick: onConfirm },
        ],
      })
    } else {
      onConfirm()
    }
  }
}

export function handleItemDelete({
  group,
  setGroup,
  setEditSelection,
}: {
  group: Accessor<ItemGroup>
  setGroup: (g: ItemGroup) => void
  setEditSelection: (sel: null) => void
}) {
  debug('handleItemDelete called', { group: group() })
  return (itemId: TemplateItem['id']) => {
    setGroup(removeItemFromGroup(group(), itemId))
    setEditSelection(null)
  }
}

/**
 * Handles updating a UnifiedItem's quantity based on macro overflow logic
 */
export function handleUnifiedItemQuantityUpdate({
  item,
  setItem,
  showConfirmModal,
}: {
  item: Accessor<UnifiedItem>
  setItem: (item: UnifiedItem) => void
  showConfirmModal: (opts: {
    title: string
    body: string
    actions: Array<{
      text: string
      onClick: () => void
      primary?: boolean
    }>
  }) => void
}) {
  return (newQuantity: number) => {
    const updatedItem = updateUnifiedItemQuantity(item(), newQuantity)

    // Check for macro overflow
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ !== null) {
      const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))

      // Convert UnifiedItem to TemplateItem format for overflow check
      // TODO: Update isOverflow to work with UnifiedItems directly
      const templateItem = {
        id: updatedItem.id,
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        macros: updatedItem.macros,
        reference:
          updatedItem.reference.type === 'food' ? updatedItem.reference.id : 0,
        __type: 'Item' as const,
      }

      const originalTemplateItem = {
        id: item().id,
        name: item().name,
        quantity: item().quantity,
        macros: item().macros,
        reference:
          item().reference.type === 'food'
            ? (item().reference as { id: number }).id
            : 0,
        __type: 'Item' as const,
      }

      const isOverflowing = isOverflow(templateItem, 'carbs', {
        currentDayDiet: currentDayDiet_,
        macroTarget: macroTarget_,
        macroOverflowOptions: {
          enable: true,
          originalItem: originalTemplateItem,
        },
      })

      if (isOverflowing) {
        showConfirmModal({
          title: 'Aviso de Excesso de Macros',
          body: 'Esta alteração pode causar excesso nas metas diárias. Deseja continuar?',
          actions: [
            {
              text: 'Continuar',
              onClick: () => setItem(updatedItem),
              primary: true,
            },
            {
              text: 'Cancelar',
              onClick: () => {},
            },
          ],
        })
        return
      }
    }

    setItem(updatedItem)
  }
}

/**
 * Handles updating a UnifiedItem's macros
 */
export function handleUnifiedItemMacrosUpdate({
  item,
  setItem,
}: {
  item: Accessor<UnifiedItem>
  setItem: (item: UnifiedItem) => void
}) {
  return (newMacros: MacroNutrients) => {
    const updatedItem = updateUnifiedItemMacros(item(), newMacros)
    setItem(updatedItem)
  }
}
