import { createEffect, createSignal, onMount } from 'solid-js'
import { Datepicker, Input, initTE } from 'tw-elements'

// https://tw-elements.com/docs/standard/forms/datepicker/#section-input-toggle
export function DatePicker () {
  const id = 'shouldbedynamic'

  const [day, setDay] = createSignal('')

  createEffect(() => {
    console.debug(`[Foda] Day: ${day()}`)
  })

  onMount(() => {
    initTE({ Datepicker, Input })

    // eslint-disable-next-line no-new
    new Datepicker(
      document.getElementById(id),
      {
        format: 'yyyy-mm-dd'
      })
  })

  return (
      <div class='dark'>
        <div
          class="relative mb-3"
          data-te-datepicker-init
          data-te-input-wrapper-init
          id={id}
        >
          <input
            type="text"
            class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
            data-te-datepicker-toggle-ref
            data-te-datepicker-toggle-button-ref
            placeholder="Select a date"
            value={day()}
            onInput={(e) => setDay(e.currentTarget.value)}
          />
          <label
            for="floatingInput"
            class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
          >
            Select a date
          </label>
        </div>
      </div>
  )
}