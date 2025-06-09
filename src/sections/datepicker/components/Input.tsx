import dayjs from 'dayjs'

import { BORDER_COLOR, DATE_FORMAT, RING_COLOR } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import { dateIsValid, parseFormattedDate } from '~/sections/datepicker/helpers'

import DatepickerToggleButton from '~/sections/datepicker/components/ToggleButton'
import { createEffect, useContext } from 'solid-js'

type Props = {
  setContextRef?: (ref: HTMLInputElement) => void
}

const Input = (e: Props) => {
  // Context
  const datepickerStore = useContext(DatepickerContext)

  // UseRefs
  // eslint-disable-next-line prefer-const
  let buttonRef = undefined as HTMLButtonElement | undefined
  // eslint-disable-next-line prefer-const
  let inputRef = undefined as HTMLInputElement | undefined

  // Functions
  const getClassName = () => {
    const input = inputRef

    const {
      primaryColor,
      inputClassName,
      classNames
    } = datepickerStore()
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (input && typeof classNames !== 'undefined' && typeof classNames?.input === 'function') {
      return classNames.input(input)
    }

    const border = BORDER_COLOR.focus[primaryColor as keyof typeof BORDER_COLOR.focus]
    const ring =
            RING_COLOR['second-focus'][primaryColor as keyof (typeof RING_COLOR)['second-focus']]

    const defaultInputClassName = `relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full border-gray-300 dark:bg-slate-800 dark:text-white/80 dark:border-slate-600 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed ${border} ${ring}`

    return typeof inputClassName === 'function'
      ? inputClassName(defaultInputClassName)
      : typeof inputClassName === 'string' && inputClassName !== ''
        ? inputClassName
        : defaultInputClassName
  }

  const handleInputChange =
    (e: any) => {
      const inputValue = e.target.value
      const {
        asSingle,
        displayFormat,
        separator,
        changeDatepickerValue,
        changeDayHover,
        changeInputText
      } = datepickerStore()
      const dates = []

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (asSingle) {
        const date = parseFormattedDate(inputValue, displayFormat)
        if (dateIsValid(date.toDate())) {
          dates.push(date.format(DATE_FORMAT))
        }
      } else {
        const parsed = inputValue.split(separator)

        let startDate = null
        let endDate = null

        if (parsed.length === 2) {
          startDate = parseFormattedDate(parsed[0], displayFormat)
          endDate = parseFormattedDate(parsed[1], displayFormat)
        } else {
          const middle = Math.floor(inputValue.length / 2)
          startDate = parseFormattedDate(inputValue.slice(0, middle), displayFormat)
          endDate = parseFormattedDate(inputValue.slice(middle), displayFormat)
        }

        if (
          dateIsValid(startDate.toDate()) &&
                    dateIsValid(endDate.toDate()) &&
                    startDate.isBefore(endDate)
        ) {
          dates.push(startDate.format(DATE_FORMAT))
          dates.push(endDate.format(DATE_FORMAT))
        }
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (dates[0]) {
        changeDatepickerValue(
          {
            startDate: dates[0],
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            endDate: dates[1] || dates[0]
          },
          e.target
        )
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (dates[1]) changeDayHover(dayjs(dates[1]).add(-1, 'day').format(DATE_FORMAT))
        else changeDayHover(dates[0])
      }

      changeInputText(e.target.value)
    }

  const handleInputKeyDown =
    (e: any) => {
      const {
        hideDatepicker
      } = datepickerStore()
      if (e.key === 'Enter') {
        const input = inputRef
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (input) {
          input.blur()
        }
        hideDatepicker()
      }
    }

  const renderToggleIcon =
    (isEmpty: boolean) => {
      const {
        toggleIcon
      } = datepickerStore()
      return <>{typeof toggleIcon === 'undefined'
        ? (
                <DatepickerToggleButton isEmpty={isEmpty} />
          )
        : (
            toggleIcon(isEmpty)
          )}</>
    }

  const getToggleClassName = () => {
    const button = buttonRef
    const {
      classNames,
      toggleClassName
    } = datepickerStore()
    if (
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      button &&
            typeof classNames !== 'undefined' &&
            typeof classNames?.toggleButton === 'function'
    ) {
      return classNames.toggleButton(button)
    }

    const defaultToggleClassName =
            'absolute right-0 h-full px-3 text-gray-400 focus:outline-hidden disabled:opacity-40 disabled:cursor-not-allowed'

    return typeof toggleClassName === 'function'
      ? toggleClassName(defaultToggleClassName)
      : typeof toggleClassName === 'string' && toggleClassName !== ''
        ? toggleClassName
        : defaultToggleClassName
  }

  // UseEffects && UseLayoutEffect
  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (inputRef && e.setContextRef && typeof e.setContextRef === 'function') {
      e.setContextRef(inputRef)
    }
  })

  createEffect(() => {
    const button = buttonRef

    function focusInput (e: Event) {
      e.stopPropagation()
      const input = inputRef
      const {
        inputText,
        changeInputText,
        dayHover,
        changeDayHover,
        period,
        changeDatepickerValue
      } = datepickerStore()
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (input) {
        input.focus()
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (inputText) {
          changeInputText('')
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (dayHover) {
            changeDayHover(null)
          }
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (period.start && period.end) {
            changeDatepickerValue(
              {
                startDate: null,
                endDate: null
              },
              input
            )
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (button) {
      button.addEventListener('click', focusInput)
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (button) {
        button.removeEventListener('click', focusInput)
      }
    }
  })

  createEffect(() => {
    const {
      calendarContainer,
      arrowContainer,
      popoverDirection
    } = datepickerStore()
    const div = calendarContainer
    const input = inputRef
    const arrow = arrowContainer

    function showCalendarContainer () {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (arrow && div?.classList.contains('hidden')) {
        div.classList.remove('hidden')
        div.classList.add('block')

        // window.innerWidth === 767
        const popoverOnUp = popoverDirection === 'up'
        const popoverOnDown = popoverDirection === 'down'
        if (
          popoverOnUp ||
                    (window.innerWidth > 767 &&
                        window.screen.height - 100 < div.getBoundingClientRect().bottom &&
                        !popoverOnDown)
        ) {
          div.classList.add('bottom-full')
          div.classList.add('mb-2.5')
          div.classList.remove('mt-2.5')
          arrow.classList.add('-bottom-2')
          arrow.classList.add('border-r')
          arrow.classList.add('border-b')
          arrow.classList.remove('border-l')
          arrow.classList.remove('border-t')
        }

        setTimeout(() => {
          div.classList.remove('translate-y-4')
          div.classList.remove('opacity-0')
          div.classList.add('translate-y-0')
          div.classList.add('opacity-1')
        }, 1)
      }
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (div && input) {
      input.addEventListener('focus', showCalendarContainer)
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (input) {
        input.removeEventListener('focus', showCalendarContainer)
      }
    }
  })

  return (
        <>
            <input
                ref={inputRef}
                type="text"
                class={getClassName()}
                disabled={datepickerStore().disabled}
                readOnly={datepickerStore().readOnly}
                placeholder={
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
                    datepickerStore().placeholder || `${datepickerStore().displayFormat}${datepickerStore().asSingle ? '' : ` ${datepickerStore().separator} ${datepickerStore().displayFormat}`}`
                }
                value={datepickerStore().inputText}
                id={datepickerStore().inputId}
                name={datepickerStore().inputName}
                autocomplete="off"
                role="presentation"
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
            />

            <button
                type="button"
                ref={buttonRef}
                disabled={datepickerStore().disabled}
                class={`${getToggleClassName()} cursor-pointer`}
            >
      { /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */ }
                {renderToggleIcon(!datepickerStore().inputText?.length)}
            </button>
        </>
  )
}

export default Input
