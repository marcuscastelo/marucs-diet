import { Accessor, createSignal, For, Setter, Show } from 'solid-js'

import { calcItemMacros } from '~/legacy/utils/macroMath'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { updateItemGroup } from '~/modules/diet/item-group/application/itemGroup'
import { MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import {
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { stringToDate } from '~/shared/utils/date/dateUtils'
import { getTopContributors } from '~/modules/diet/item-group/application/getTopContributors'
import { calcMaxItemQuantity } from '~/modules/diet/item-group/application/calcMaxItemQuantity'
import { type MacroContributorEntry } from '~/modules/diet/item-group/domain/types'

/**
 * Renders a single macro contributor card with controls.
 * @param props - The macro, entry, and handlers for actions.
 * @returns JSX.Element
 */
function MacroContributorCard(props: {
  macro: 'carbs' | 'protein' | 'fat'
  entry: MacroContributorEntry
  onNext: () => void
  onMax: (entry: MacroContributorEntry) => void
  onEdit: () => void
}) {
  return (
    <div class="flex-1">
      <ItemView
        item={() => props.entry.item}
        header={<HeaderWithActions name={props.entry.item.name} />}
        nutritionalInfo={
          <div class="flex flex-col gap-3 justify-between">
            <ItemNutritionalInfo />
            <div class="flex gap-2">
              <button
                class="btn btn-secondary"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  props.onNext()
                }}
              >
                Próximo
              </button>
              <button
                class="btn btn-accent"
                type="button"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  props.onMax(props.entry)
                }}
              >
                Max
              </button>
            </div>
          </div>
        }
        macroOverflow={() => ({ enable: false })}
        mode="summary"
        onClick={props.onEdit}
      />
    </div>
  )
}

/**
 * Renders a macro group section with its top contributor card.
 * @param props - Macro group label, macro key, items, and handlers.
 * @returns JSX.Element
 */
function MacroGroupSection(props: {
  macro: 'carbs' | 'protein' | 'fat'
  label: string
  items: MacroContributorEntry[]
  onNext: (itemId: number) => void
  onMax: (entry: MacroContributorEntry) => void
  onEdit: () => void
}) {
  return (
    <div>
      <div class="font-bold text-lg mb-2">{props.label}</div>
      <div class="flex gap-2 flex-col">
        <Show when={props.items.length > 0}>
          <MacroContributorCard
            macro={props.macro}
            entry={props.items[0]!}
            onNext={() => props.onNext(props.items[0]!.item.id)}
            onMax={props.onMax}
            onEdit={props.onEdit}
          />
        </Show>
      </div>
    </div>
  )
}

export function DayMacrosContributorsModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  const allItems = () =>
    currentDayDiet()?.meals.flatMap((meal) =>
      meal.groups.flatMap((group) => group.items),
    ) ?? []

  /**
   * Returns the top N items that, if reduced, most effectively decrease a single macro (carbs, protein, or fat) with minimal impact on others.
   * Ranks by total macro contribution, then by macro density (macro per gram).
   * @param macro - The macro nutrient to analyze ('carbs', 'protein' | 'fat')
   * @param n - Number of top contributors to return
   * @returns Array of { item, handleApply }
   */
  // function getTopContributors(macro: 'carbs' | 'protein' | 'fat', n = 3) { ... }
  const [editing, setEditing] = createSignal<{
    macro: 'carbs' | 'protein' | 'fat'
    items: MacroContributorEntry[]
    currentIdx: number
  } | null>(null)

  // Signals para top contributors editáveis
  const [topCarbs, setTopCarbs] = createSignal(getTopContributors('carbs', 100))
  const [topProtein, setTopProtein] = createSignal(
    getTopContributors('protein', 100),
  )
  const [topFat, setTopFat] = createSignal(getTopContributors('fat', 100))

  const macroGroups = () =>
    [
      { macro: 'carbs', label: 'Carboidrato', items: topCarbs },
      { macro: 'protein', label: 'Proteína', items: topProtein },
      { macro: 'fat', label: 'Gordura', items: topFat },
    ] as const

  function handleEditStart(
    macro: 'carbs' | 'protein' | 'fat',
    items: MacroContributorEntry[],
  ) {
    setEditing({ macro, items, currentIdx: 0 })
  }

  function handleDismiss(macro: keyof MacroNutrients, itemId: number) {
    if (macro === 'carbs') {
      setTopCarbs((prev) => prev.filter((e) => e.item.id !== itemId))
    }
    if (macro === 'protein') {
      setTopProtein((prev) => prev.filter((e) => e.item.id !== itemId))
    }
    if (macro === 'fat') {
      setTopFat((prev) => prev.filter((e) => e.item.id !== itemId))
    }
    // Se o usuário está editando esse macro, avance para o próximo
    setEditing((prev) => {
      if (!prev || prev.macro !== macro) return prev
      const newItems = prev.items.filter((e) => e.item.id !== itemId)
      if (newItems.length === 0) return null
      return { ...prev, items: newItems, currentIdx: 0 }
    })
  }

  // Handlers for MacroContributorCard actions
  function handleMaxQuantity(entry: {
    item: TemplateItem
    handleApply: (item: TemplateItem) => Promise<void>
  }) {
    const maxQuantity = calcMaxItemQuantity(entry.item)
    const edited = {
      ...entry.item,
      quantity: maxQuantity,
    }
    void entry.handleApply(edited)
  }

  const [isOpen, setIsOpen] = createSignal(false)

  return (
    <Show when={props.visible}>
      <ModalContextProvider
        visible={props.visible}
        setVisible={props.setVisible}
      >
        <Modal hasBackdrop={true} class="max-w-lg">
          <Modal.Header
            title={<span>Principais Contribuintes de Macros</span>}
          />
          <div class="flex flex-col gap-4 p-4">
            <For each={macroGroups()}>
              {(macroGroup) => (
                <MacroGroupSection
                  macro={macroGroup.macro}
                  label={macroGroup.label}
                  items={macroGroup.items()}
                  onNext={(itemId) => handleDismiss(macroGroup.macro, itemId)}
                  onMax={handleMaxQuantity}
                  onEdit={() =>
                    handleEditStart(macroGroup.macro, macroGroup.items())
                  }
                />
              )}
            </For>
          </div>
          <Modal.Footer>
            <button
              class="btn btn-primary"
              onClick={() => props.setVisible(false)}
            >
              Fechar
            </button>
          </Modal.Footer>
        </Modal>
        {(() => {
          const e = editing()
          const current = e && e.items[e.currentIdx]
          return (
            <>
              {e && current && (
                <>
                  <ExternalItemEditModal
                    visible={() => !!editing()}
                    setVisible={(value) => {
                      const resolved =
                        typeof value === 'function' ? value(!!editing()) : value
                      props.setVisible(value)
                      if (!resolved) setEditing(null)
                    }}
                    targetName={current.item.name}
                    item={() => current.item}
                    macroOverflow={() => ({
                      enable: true,
                      originalItem: current.item,
                    })}
                    onApply={(item) => {
                      void current.handleApply(item)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </>
              )}
            </>
          )
        })()}
      </ModalContextProvider>
    </Show>
  )
}

export default DayMacrosContributorsModal
