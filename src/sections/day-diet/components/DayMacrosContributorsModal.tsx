import { Accessor, createSignal, For, Setter, Show } from 'solid-js'

import { calcItemMacros } from '~/legacy/utils/macroMath'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import { ItemView } from '~/sections/food-item/components/ItemView'

export function DayMacrosContributorsModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  const dayDiet = currentDayDiet()
  const allItems: TemplateItem[] = dayDiet
    ? dayDiet.meals.flatMap((meal) =>
        meal.groups.flatMap((group) => group.items),
      )
    : []

  function getTopContributors(macro: 'carbs' | 'protein' | 'fat', n = 3) {
    return [...allItems]
      .sort((a, b) => calcItemMacros(b)[macro] - calcItemMacros(a)[macro])
      .slice(0, n)
  }

  const [editing, setEditing] = createSignal<{
    macro: 'carbs' | 'protein' | 'fat'
    item: TemplateItem
  } | null>(null)

  const topCarbs = getTopContributors('carbs', 3)
  const topProtein = getTopContributors('protein', 3)
  const topFat = getTopContributors('fat', 3)

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
            <For
              each={
                [
                  { macro: 'carbs', label: 'Carboidrato', items: topCarbs },
                  { macro: 'protein', label: 'Proteína', items: topProtein },
                  { macro: 'fat', label: 'Gordura', items: topFat },
                ] as const
              }
            >
              {(macroGroup) => (
                <div>
                  <div class="font-bold text-lg mb-2">{macroGroup.label}</div>
                  <div class="flex gap-2">
                    <For each={macroGroup.items}>
                      {(item) => (
                        <div class="flex-1">
                          <ItemView
                            item={() => item}
                            macroOverflow={() => ({ enable: false })}
                            mode="summary"
                            onClick={() =>
                              setEditing({ macro: macroGroup.macro, item })
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
          <ItemEditModal
            targetName={editing()?.item.name ?? ''}
            item={() => editing()!.item}
            macroOverflow={() => ({ enable: false })}
            onApply={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </Show>
      </ModalContextProvider>
    </Show>
  )
}

export default DayMacrosContributorsModal
