import { type Accessor, type JSXElement } from 'solid-js'

export function Toggle(props: {
  label: JSXElement
  checked: Accessor<boolean>
  setChecked: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <>
      <label class="flex items-center cursor-pointer justify-between">
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {props.label}
        </span>
        <input
          type="checkbox"
          value=""
          class="sr-only peer"
          checked={props.checked()}
          disabled={props.disabled}
          onChange={(e) => {
            e.currentTarget.blur()
            props.setChecked(e.currentTarget.checked)
          }}
        />
        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 dark:peer-focus:ring-blue-900 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-700" />
      </label>
    </>
  )
}
