import dayjs from 'dayjs'
import { For, type JSXElement, Show, useContext } from 'solid-js'

import { DATE_FORMAT, TEXT_COLOR } from '~/sections/datepicker/constants'
import DEFAULT_SHORTCUTS from '~/sections/datepicker/constants/shortcuts'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import { type Period, type ShortcutsItem } from '~/sections/datepicker/types'

type ItemTemplateProps = {
  children: JSXElement
  key: number
  item: ShortcutsItem | ShortcutsItem[]
}

const ItemTemplate = (props: ItemTemplateProps) => {
  const datepickerStore = useContext(DatepickerContext)

  // Functions
  const getClassName: () => string = () => {
    const textColor = TEXT_COLOR['600'][datepickerStore().primaryColor as keyof (typeof TEXT_COLOR)['600']]
    const textColorHover = TEXT_COLOR.hover[datepickerStore().primaryColor as keyof typeof TEXT_COLOR.hover]
    return `whitespace-nowrap w-1/2 md:w-1/3 lg:w-auto transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/10 p-2 rounded cursor-pointer ${textColor} ${textColorHover}`
  }

  const chosePeriod =
    (item: Period) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (datepickerStore().dayHover) {
        datepickerStore().changeDayHover(null)
      }
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
      if (datepickerStore().period.start || datepickerStore().period.end) {
        datepickerStore().changePeriod({
          start: null,
          end: null
        })
      }
      datepickerStore().changePeriod(item)
      datepickerStore().changeDatepickerValue({
        startDate: item.start,
        endDate: item.end
      })
      datepickerStore().updateFirstDate(dayjs(item.start))
      datepickerStore().hideDatepicker()
    }

  const children = () => props?.children

  return (
    <li
      class={getClassName()}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        chosePeriod(props?.item.period)
      }}
    >
      {children()}
    </li>
  )
}

const Shortcuts = () => {
  // Contexts
  const datepickerStore = useContext(DatepickerContext)

  const callPastFunction = (data: unknown, numberValue: number) => {
    return typeof data === 'function' ? data(numberValue) : null
  }

  const shortcutOptions = (): Array<[string, ShortcutsItem | ShortcutsItem[]]> => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const configs = datepickerStore().configs
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!configs?.shortcuts) {
      return Object.entries(DEFAULT_SHORTCUTS)
    }

    return Object.entries(configs.shortcuts).flatMap(([key, customConfig]) => {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_SHORTCUTS, key)) {
        return [[key, DEFAULT_SHORTCUTS[key] as ShortcutsItem | ShortcutsItem[]]]
      }

      const { text, period } = customConfig as {
        text: string
        period: { start: string, end: string }
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!text || !period) {
        return []
      }

      const start = dayjs(period.start)
      const end = dayjs(period.end)

      if (start.isValid() && end.isValid() && (start.isBefore(end) || start.isSame(end))) {
        return [
          [
            text,
            {
              text,
              period: {
                start: start.format(DATE_FORMAT),
                end: end.format(DATE_FORMAT)
              }
            }
          ]
        ]
      }  

      return []
    }) 
  }

  const printItemText = (item: ShortcutsItem) => {
    return item?.text ?? null
  }

  return (
    <Show when={shortcutOptions?.length}>
      <div class="md:border-b mb-3 lg:mb-0 lg:border-r lg:border-b-0 border-gray-300 dark:border-gray-700 pr-1">
        <ul class="w-full tracking-wide flex flex-wrap lg:flex-col pb-1 lg:pb-0">
          <For each={shortcutOptions()}>
            {(([key, item], index) =>
              Array.isArray(item)
                ? (
                    item.map((item, index) => (
                    <ItemTemplate key={index} item={item}>
                      <Show when={datepickerStore().configs?.shortcuts}>
                        {(shortcuts) => (
                          <>
                            {
                              key === 'past' &&
                                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                                key in shortcuts() &&
                                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                                item.daysNumber
                                ? callPastFunction(
                                  shortcuts()[key as 'past'],
                                  item.daysNumber
                                )
                                : item.text
                            }
                          </>)}
                      </Show>
                    </ItemTemplate>
                    ))
                  )
                : (
                  <ItemTemplate key={index()} item={item}>
                      <Show when={datepickerStore().configs?.shortcuts}>
                      {(shortcuts) => (
                          <>
                      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
                      {key in shortcuts()
                        ? typeof (shortcuts() as any)[key] === 'object'
                          ? printItemText(item)
                          : (shortcuts() as any)[key]
                        : printItemText(item)}
                        </>)}
                      </Show>
                  </ItemTemplate>
                  )
            )}
          </For>
        </ul>
      </div>
    </Show>
  )
}

export default Shortcuts
