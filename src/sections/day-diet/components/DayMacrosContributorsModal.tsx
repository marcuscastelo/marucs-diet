import { Accessor, createSignal, For, Setter, Show } from 'solid-js'

import { calcItemMacros } from '~/legacy/utils/macroMath'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { updateItemGroup } from '~/modules/diet/item-group/application/itemGroup'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import {
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'

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
   * @param macro - The macro nutrient to analyze ('carbs', 'protein', or 'fat')
   * @param n - Number of top contributors to return
   * @returns Array of { item, handleApply }
   */
  function getTopContributors(macro: 'carbs' | 'protein' | 'fat', n = 3) {
    // For each item, calculate: total macro, macro density, macro proportion
    const scored = allItems().map((item) => {
      const macros = calcItemMacros(item)
      const macroTotal = macros[macro] * item.quantity
      const macroDensity = macros[macro]
      const macroSum = macros.carbs + macros.protein + macros.fat
      const macroProportion = macroSum > 0 ? macros[macro] / macroSum : 0
      return {
        item,
        macroTotal,
        macroDensity,
        macroProportion,
      }
    })

    // Filter: only items where this macro is the dominant macro (proportion > 0.7)
    const filtered = scored.filter(
      (s) => s.macroProportion > 0.7 && s.macroTotal > 0,
    )

    // Sort: first by macroTotal (desc), then by macroDensity (desc)
    filtered.sort((a, b) => {
      if (b.macroTotal !== a.macroTotal) return b.macroTotal - a.macroTotal
      return b.macroDensity - a.macroDensity
    })

    return filtered.slice(0, n).map(({ item }) => ({
      item,
      handleApply: async (edited: TemplateItem) => {
        const dayDiet = currentDayDiet()
        if (!dayDiet) return
        for (const meal of dayDiet.meals) {
          for (const group of meal.groups) {
            const idx = group.items.findIndex((i) => i.id === edited.id)
            if (idx !== -1) {
              const updatedItems = group.items.map((i) =>
                i.id === edited.id && i.__type === edited.__type ? edited : i,
              )
              await updateItemGroup(dayDiet.id, meal.id, group.id, {
                ...group,
                items: updatedItems,
              })
              return
            }
          }
        }
      },
    }))
  }

  const [editing, setEditing] = createSignal<{
    macro: 'carbs' | 'protein' | 'fat'
    item: TemplateItem
    handleApply: (item: TemplateItem) => void
  } | null>(null)

  const topCarbs = () => getTopContributors('carbs', 2)
  const topProtein = () => getTopContributors('protein', 2)
  const topFat = () => getTopContributors('fat', 2)

  const macroGroups = () =>
    [
      { macro: 'carbs', label: 'Carboidrato', items: topCarbs },
      { macro: 'protein', label: 'Proteína', items: topProtein },
      { macro: 'fat', label: 'Gordura', items: topFat },
    ] as const

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
                <div>
                  <div class="font-bold text-lg mb-2">{macroGroup.label}</div>
                  <div class="flex gap-2 flex-col">
                    <For each={macroGroup.items()}>
                      {(entry) => (
                        <div class="flex-1">
                          <ItemView
                            item={() => entry.item}
                            header={
                              <HeaderWithActions name={entry.item.name} />
                            }
                            nutritionalInfo={<ItemNutritionalInfo />}
                            macroOverflow={() => ({ enable: false })}
                            mode="summary"
                            onClick={() =>
                              setEditing({
                                macro: macroGroup.macro,
                                item: entry.item,
                                handleApply: entry.handleApply,
                              })
                            }
                          />
                        </div>
                      )}
                    </For>
                  </div>
                </div>
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
        <Show when={editing()}>
          <ExternalItemEditModal
            visible={() => !!editing()}
            setVisible={(value) => {
              const resolved =
                typeof value === 'function' ? value(!!editing()) : value
              props.setVisible(value)
              if (!resolved) setEditing(null)
            }}
            targetName={editing()?.item.name ?? ''}
            item={() => editing()!.item}
            macroOverflow={() => ({
              enable: true,
              originalItem: editing()!.item,
            })}
            onApply={editing() ? editing()!.handleApply : () => {}}
            onCancel={() => setEditing(null)}
          />
        </Show>
      </ModalContextProvider>
    </Show>
  )
}

export default DayMacrosContributorsModal
