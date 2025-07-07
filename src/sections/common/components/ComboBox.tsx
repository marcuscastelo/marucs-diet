import { For, type JSX } from 'solid-js'

export type ComboBoxOption<T extends string> = {
  value: T
  label: string
}

export type ComboBoxProps<T extends string> = {
  options: readonly ComboBoxOption<T>[]
  value: T
  onChange: (value: T) => void
  class?: string
  optionClass?: string
}

/**
 * ComboBox component for selecting a value from a list of options.
 * @param options List of options to display
 * @param value Current selected value
 * @param onChange Callback when value changes
 * @param class Optional className
 */
export function ComboBox<T extends string>(
  props: ComboBoxProps<T>,
): JSX.Element {
  return (
    <select
      class={`select select-bordered ${props.class ?? ''}`}
      value={props.value}
      onInput={(e) => props.onChange(e.currentTarget.value as T)}
    >
      <For each={props.options}>
        {(option) => (
          <option value={option.value} class={props.optionClass}>
            {option.label}
          </option>
        )}
      </For>
    </select>
  )
}
