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
    items: { item: TemplateItem; handleApply: (item: TemplateItem) => void }[]
    currentIdx: number
  } | null>(null)

  // Signals para top contributors editáveis
  const [topCarbs, setTopCarbs] = createSignal(getTopContributors('carbs', 5))
  const [topProtein, setTopProtein] = createSignal(
    getTopContributors('protein', 5),
  )
  const [topFat, setTopFat] = createSignal(getTopContributors('fat', 5))

  const macroGroups = () =>
    [
      { macro: 'carbs', label: 'Carboidrato', items: topCarbs },
      { macro: 'protein', label: 'Proteína', items: topProtein },
      { macro: 'fat', label: 'Gordura', items: topFat },
    ] as const

  function handleEditStart(
    macro: 'carbs' | 'protein' | 'fat',
    items: { item: TemplateItem; handleApply: (item: TemplateItem) => void }[],
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
                    <For
                      each={
                        macroGroup.items().length > 0
                          ? [macroGroup.items()[0]]
                          : []
                      }
                    >
                      {(entry) =>
                        entry && (
                          <div class="flex-1">
                            <ItemView
                              item={() => entry.item}
                              header={
                                <HeaderWithActions name={entry.item.name} />
                              }
                              nutritionalInfo={
                                <div class="flex flex-col gap-3 justify-between">
                                  <ItemNutritionalInfo />
                                  <div class="flex gap-2">
                                    <button
                                      class="btn btn-secondary"
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDismiss(
                                          macroGroup.macro,
                                          entry.item.id,
                                        )
                                      }}
                                    >
                                      Próximo
                                    </button>
                                    <button
                                      class="btn btn-accent"
                                      type="button"
                                      onClick={(e: MouseEvent) => {
                                        e.stopPropagation()
                                        const dayDiet = currentDayDiet()
                                        if (!dayDiet) return
                                        const macroTargets =
                                          getMacroTargetForDay(
                                            stringToDate(dayDiet.target_day),
                                          )
                                        if (!macroTargets) return
                                        const itemMacros = calcItemMacros(
                                          entry.item,
                                        )
                                        const macroKeys: (keyof typeof itemMacros)[] =
                                          ['carbs', 'protein', 'fat']
                                        let max = Infinity
                                        for (const macro of macroKeys) {
                                          const per100g = itemMacros[macro]
                                          const macroTarget =
                                            macroTargets[macro]
                                          if (
                                            typeof per100g === 'number' &&
                                            per100g > 0 &&
                                            typeof macroTarget === 'number'
                                          ) {
                                            const allowed = Math.floor(
                                              macroTarget / per100g,
                                            )
                                            if (allowed < max) {
                                              max = allowed
                                            }
                                          }
                                        }
                                        const maxQuantity =
                                          max === Infinity ? 0 : max * 0.96
                                        const edited = {
                                          ...entry.item,
                                          quantity: maxQuantity,
                                        }
                                        entry
                                          .handleApply(edited)
                                          .catch((err) => {
                                            console.error(
                                              'Erro ao aplicar edição:',
                                              err,
                                            )
                                          })
                                      }}
                                    >
                                      Max
                                    </button>
                                  </div>
                                </div>
                              }
                              macroOverflow={() => ({ enable: false })}
                              mode="summary"
                              onClick={() =>
                                handleEditStart(
                                  macroGroup.macro,
                                  macroGroup.items(),
                                )
                              }
                            />
                          </div>
                        )
                      }
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
                    onApply={current.handleApply}
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
