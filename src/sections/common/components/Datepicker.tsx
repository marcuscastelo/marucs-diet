import { cn } from '@/legacy/utils/cn'
import { setTargetDay, targetDay } from '@/modules/diet/day-diet/application/dayDiet'
import { onMount } from 'solid-js'

// https://tw-elements.com/docs/standard/forms/datepicker/#section-input-toggle
export function DatePicker (props: {
  class?: string
}) {
  const datepickerId = `datepicker-${Math.random().toString(36).substring(7)}`

  onMount(() => {
    const el = document.getElementById(datepickerId) as HTMLInputElement
    setInterval(() => {
      setTargetDay(el.value)
    }
    , 500)
  })

  return (
      <div class={cn('relative', props.class)}>
        <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
          </svg>
        </div>
        <input
          id={datepickerId}
          value={targetDay()}
          onBeforeInput={(e) => { alert(e.target.value) }}
          type="text"
          class={cn(
            'block w-full p-2.5 pl-10 rounded-lg',
            'bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600',
            'text-sm text-gray-900 dark:text-white dark:placeholder-gray-400',
            'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500')}
          placeholder="Select date"
          {...{
            datepicker: true,
            'datepicker-autohide': true,
            'datepicker-format': 'yyyy-mm-dd'
          }}
        />
      </div>
  )
}
