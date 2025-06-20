import { type Accessor, createSignal, type Setter, Show } from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { updateUnifiedItemName } from '~/modules/diet/unified-item/domain/unifiedItemOperations'
import {
  asFoodItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { type MacroValues } from '~/sections/common/components/MaxQuantityButton'
import { type UseFieldReturn } from '~/sections/common/hooks/useField'
import { GroupChildrenEditor } from '~/sections/unified-item/components/GroupChildrenEditor'
import { QuantityControls } from '~/sections/unified-item/components/QuantityControls'
import { QuantityShortcuts } from '~/sections/unified-item/components/QuantityShortcuts'
import { UnifiedItemFavorite } from '~/sections/unified-item/components/UnifiedItemFavorite'
import { UnifiedItemName } from '~/sections/unified-item/components/UnifiedItemName'
import { UnifiedItemNutritionalInfo } from '~/sections/unified-item/components/UnifiedItemNutritionalInfo'
import { UnifiedItemView } from '~/sections/unified-item/components/UnifiedItemView'
import { createDebug } from '~/shared/utils/createDebug'
import { calcDayMacros, calcUnifiedItemMacros } from '~/shared/utils/macroMath'

const debug = createDebug()

type InlineNameEditorProps = {
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
}

function InlineNameEditor(props: InlineNameEditorProps) {
  const [isEditing, setIsEditing] = createSignal(false)
  const [tempName, setTempName] = createSignal('')

  const startEditing = () => {
    setTempName(props.item().name)
    setIsEditing(true)
  }

  const saveEdit = () => {
    const newName = tempName().trim()
    if (newName && newName !== props.item().name) {
      const updatedItem = updateUnifiedItemName(props.item(), newName)
      props.setItem(updatedItem)
    }
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setTempName('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  return (
    <Show
      when={isEditing()}
      fallback={
        <button
          onClick={startEditing}
          class="text-left hover:bg-gray-100 rounded px-1 -mx-1 transition-colors"
          title="Click to edit name"
        >
          {props.item().name}
        </button>
      }
    >
      <input
        type="text"
        value={tempName()}
        onInput={(e) => setTempName(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onBlur={saveEdit}
        class="bg-transparent border-none outline-none text-inherit font-inherit w-full"
        autofocus
      />
    </Show>
  )
}

export type UnifiedItemEditBodyProps = {
  canApply: boolean
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
  quantityField: UseFieldReturn<number>
  onEditChild?: (child: UnifiedItem) => void
  recipeViewMode?: 'recipe' | 'group'
  clipboardActions?: {
    onCopy: () => void
    onPaste: () => void
    hasValidPastableOnClipboard: boolean
  }
  onAddNewItem?: () => void
  showAddItemButton?: boolean
}

export function UnifiedItemEditBody(props: UnifiedItemEditBodyProps) {
  debug('[UnifiedItemEditBody] called', props)

  // Cálculo do restante disponível de macros
  function getAvailableMacros(): MacroValues {
    debug('[UnifiedItemEditBody] getAvailableMacros')
    const dayDiet = currentDayDiet()
    const macroTarget = dayDiet
      ? getMacroTargetForDay(new Date(dayDiet.target_day))
      : null
    const originalItem = props.macroOverflow().originalItem
    if (!dayDiet || !macroTarget) {
      return { carbs: 0, protein: 0, fat: 0 }
    }
    const dayMacros = calcDayMacros(dayDiet)
    const originalMacros = originalItem
      ? calcUnifiedItemMacros(originalItem)
      : { carbs: 0, protein: 0, fat: 0 }
    return {
      carbs: macroTarget.carbs - dayMacros.carbs + originalMacros.carbs,
      protein: macroTarget.protein - dayMacros.protein + originalMacros.protein,
      fat: macroTarget.fat - dayMacros.fat + originalMacros.fat,
    }
  }

  const handleQuantitySelect = (quantity: number) => {
    debug('[UnifiedItemEditBody] shortcut quantity', quantity)
    props.quantityField.setRawValue(quantity.toString())
  }

  return (
    <>
      {/* Para alimentos e receitas (modo normal): controles de quantidade normal */}
      <Show
        when={
          isFoodItem(props.item()) ||
          (isRecipeItem(props.item()) && props.recipeViewMode !== 'group')
        }
      >
        <QuantityShortcuts onQuantitySelect={handleQuantitySelect} />

        <QuantityControls
          item={props.item}
          setItem={props.setItem}
          canApply={props.canApply}
          getAvailableMacros={getAvailableMacros}
          quantityField={props.quantityField}
        />
      </Show>

      {/* Para grupos ou receitas em modo grupo: editor de filhos */}
      <Show
        when={
          isGroupItem(props.item()) ||
          (isRecipeItem(props.item()) && props.recipeViewMode === 'group')
        }
      >
        <GroupChildrenEditor
          item={props.item}
          setItem={props.setItem}
          onEditChild={props.onEditChild}
          onAddNewItem={props.onAddNewItem}
          showAddButton={props.showAddItemButton}
        />
      </Show>

      <Show
        when={
          isFoodItem(props.item()) ||
          isRecipeItem(props.item()) ||
          isGroupItem(props.item())
        }
      >
        <UnifiedItemView
          mode="edit"
          handlers={{
            onCopy: props.clipboardActions?.onCopy,
          }}
          item={props.item}
          class="mt-4"
          header={() => (
            <HeaderWithActions
              name={
                <Show
                  when={isGroupItem(props.item())}
                  fallback={<UnifiedItemName item={props.item} />}
                >
                  <InlineNameEditor item={props.item} setItem={props.setItem} />
                </Show>
              }
              primaryActions={
                <Show when={asFoodItem(props.item())} fallback={null}>
                  {(foodItem) => (
                    <UnifiedItemFavorite foodId={foodItem().reference.id} />
                  )}
                </Show>
              }
            />
          )}
          nutritionalInfo={() => (
            <UnifiedItemNutritionalInfo item={props.item} />
          )}
        />
      </Show>
    </>
  )
}
