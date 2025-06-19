import { For } from 'solid-js'

import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

export type QuantityShortcutsProps = {
  onQuantitySelect: (quantity: number) => void
}

export function QuantityShortcuts(props: QuantityShortcutsProps) {
  const shortcutRows = [
    [10, 20, 30, 40, 50],
    [100, 150, 200, 250, 300],
  ]

  return (
    <>
      <p class="mt-1 text-gray-400">Atalhos</p>
      <For each={shortcutRows}>
        {(row) => (
          <div class="mt-1 flex w-full gap-1">
            <For each={row}>
              {(value) => (
                <div
                  class="btn-primary btn-sm btn cursor-pointer uppercase flex-1"
                  onClick={() => {
                    debug(
                      '[QuantityShortcuts] shortcut quantity selected',
                      value,
                    )
                    props.onQuantitySelect(value)
                  }}
                >
                  {value}g
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </>
  )
}
