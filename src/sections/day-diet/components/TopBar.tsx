import { createEffect } from 'solid-js'

import { TargetDayPicker } from '~/sections/common/components/TargetDayPicker'

// TODO:   make day/TopBar a common component
export default function TopBar(props: { selectedDay: string }) {
  // TODO:   Add datepicker to top bar
  createEffect(() => {
    console.debug('TopBar', props.selectedDay)
  })
  return (
    <>
      <div class="pt-6 flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
        <div class="flex-1">
          <TargetDayPicker />
        </div>
      </div>
    </>
  )
}
