import type { JSX } from 'solid-js'

export type MaxQuantityButtonProps = {
  currentValue: number
  macroTargets: Record<string, number>
  itemMacros: Record<string, number>
  onMaxSelected: (maxValue: number) => void
  disabled?: boolean
}

/**
 * Button to set the input to the maximum allowed quantity based on macro constraints.
 * @param currentValue - Current value in the input
 * @param macroTargets - Daily macro limits
 * @param itemMacros - Macro values per unit for the item
 * @param onMaxSelected - Callback to set the input value
 * @param disabled - Disables the button if true
 * @returns JSX.Element
 */
export function MaxQuantityButton(props: MaxQuantityButtonProps): JSX.Element {
  function calculateMaxQuantity(): number {
    let max = Infinity
    for (const macro in props.itemMacros) {
      const perUnit = props.itemMacros[macro]
      const macroTarget = props.macroTargets[macro]
      if (
        typeof perUnit === 'number' &&
        perUnit > 0 &&
        typeof macroTarget === 'number'
      ) {
        const allowed = Math.floor(macroTarget / perUnit)
        if (allowed < max) max = allowed
      }
    }
    return max === Infinity ? 0 : max
  }

  function handleClick() {
    if (props.disabled === true) return
    props.onMaxSelected(calculateMaxQuantity())
  }

  return (
    <button
      type="button"
      aria-label="Set maximum quantity"
      class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-blue-500 bg-transparent hover:bg-blue-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 opacity-70 hover:opacity-100 transition-opacity border-none cursor-pointer"
      style={{
        'pointer-events': props.disabled === true ? 'none' : 'auto',
        background: 'transparent',
      }}
      onClick={handleClick}
      disabled={props.disabled === true}
      tabIndex={0}
    >
      Max.
    </button>
  )
}
