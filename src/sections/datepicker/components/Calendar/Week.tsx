import { For, useContext } from 'solid-js'
import dayjs from 'dayjs'

import { DAYS } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import { loadLanguageModule, shortString, ucFirst } from '~/sections/datepicker/helpers'

const Week = () => {
  const datepickerStore = useContext(DatepickerContext)
  loadLanguageModule(datepickerStore().i18n)
  const startDateModifier = () => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (datepickerStore().startWeekOn) {
      switch (datepickerStore().startWeekOn) {
        case 'mon':
          return 1
        case 'tue':
          return 2
        case 'wed':
          return 3
        case 'thu':
          return 4
        case 'fri':
          return 5
        case 'sat':
          return 6
        case 'sun':
          return 0
        default:
          return 0
      }
    }
    return 0
  }

  return (
        <div class="grid grid-cols-7 border-b border-gray-300 dark:border-gray-700 py-2">
            <For each={DAYS}>{item => (
                <div class="tracking-wide text-gray-500 text-center">
                    {ucFirst(
                      shortString(
                        dayjs(`2022-11-${6 + (item + startDateModifier())}`)
                          .locale(datepickerStore().i18n)
                          .format('ddd')
                      )
                    )}
                </div>
            )}</For>
        </div>
  )
}

export default Week
