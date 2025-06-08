// Original implementation: https://github.com/onesine/react-tailwindcss-datepicker/tree/bf063fe6458787622ca500ec9a33d9b2feb955d1
import dayjs from 'dayjs'

import Calendar from '~/sections/datepicker/components/Calendar'
import Footer from '~/sections/datepicker/components/Footer'
import Input from '~/sections/datepicker/components/Input'
import Shortcuts from '~/sections/datepicker/components/Shortcuts'
import { COLORS, DATE_FORMAT, DEFAULT_COLOR, LANGUAGE } from '~/sections/datepicker/constants'
import DatepickerContext, { type DatepickerStore } from '~/sections/datepicker/contexts/DatepickerContext'
import { formatDate, nextMonth, previousMonth } from '~/sections/datepicker/helpers'
import useOnClickOutside from '~/sections/datepicker/hooks'
import { type Period, type DatepickerType, type ColorKeys } from '~/sections/datepicker/types'

import { Arrow, VerticalDash } from '~/sections/datepicker/components/utils'
import { createEffect, createSignal, mergeProps } from 'solid-js'

const Datepicker = (_props: DatepickerType) => {
  // Ref
  const props = mergeProps({ primaryColor: 'blue' as const, value: null, useRange: true, showFooter: false, showShortcuts: false, configs: undefined, asSingle: false, placeholder: null, separator: '~', startFrom: null, i18n: LANGUAGE, disabled: false, inputClassName: null, containerClassName: null, toggleClassName: null, toggleIcon: undefined, displayFormat: DATE_FORMAT, readOnly: false, minDate: null, maxDate: null, dateLooking: 'forward' as const, disabledDates: null, startWeekOn: 'sun', classNames: undefined, popoverDirection: undefined }, _props)
  // eslint-disable-next-line prefer-const
  let containerRef = undefined as HTMLDivElement | undefined
  // eslint-disable-next-line prefer-const
  let calendarContainerRef = undefined as HTMLDivElement | undefined
  // eslint-disable-next-line prefer-const
  let arrowRef = undefined as HTMLDivElement | undefined

  // State
  const [firstDate, setFirstDate] = createSignal<dayjs.Dayjs>(
    props.startFrom && dayjs(props.startFrom).isValid() ? dayjs(props.startFrom) : dayjs()
  )
  const [secondDate, setSecondDate] = createSignal<dayjs.Dayjs>(nextMonth(firstDate()))
  const [period, setPeriod] = createSignal<Period>({
    start: null,
    end: null
  })
  const [dayHover, setDayHover] = createSignal<string | null>(null)
  const [inputText, setInputText] = createSignal<string>('')
  const [inputRef, setInputRef] = createSignal(undefined as HTMLInputElement | undefined)

  // Custom Hooks use
  useOnClickOutside(() => containerRef, () => {
    console.debug('[Datepicker] Detected click outside')

    const container = containerRef
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (container) {
      hideDatepicker()
    }
  })

  // Functions
  const hideDatepicker = () => {
    console.debug('[Datepicker] Hiding datepicker')
    const div = calendarContainerRef
    const arrow = arrowRef
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (arrow && div && div.classList.contains('block')) {
      div.classList.remove('block')
      div.classList.remove('translate-y-0')
      div.classList.remove('opacity-1')
      div.classList.add('translate-y-4')
      div.classList.add('opacity-0')
      setTimeout(() => {
        div.classList.remove('bottom-full')
        div.classList.add('hidden')
        div.classList.add('mb-2.5')
        div.classList.add('mt-2.5')
        arrow.classList.remove('-bottom-2')
        arrow.classList.remove('border-r')
        arrow.classList.remove('border-b')
        arrow.classList.add('border-l')
        arrow.classList.add('border-t')
      }, 300)
    }
  }

  /* Start First */
  const firstGotoDate =
    (date: dayjs.Dayjs) => {
      const newDate = dayjs(formatDate(date))
      const reformatDate = dayjs(formatDate(secondDate()))
      if (newDate.isSame(reformatDate) || newDate.isAfter(reformatDate)) {
        setSecondDate(nextMonth(date))
      }
      setFirstDate(date)
    }

  const previousMonthFirst = () => {
    setFirstDate(previousMonth(firstDate()))
  }

  const nextMonthFirst = () => {
    firstGotoDate(nextMonth(firstDate()))
  }

  const changeFirstMonth =
    (month: number) => {
      firstGotoDate(dayjs(`${firstDate().year()}-${month < 10 ? '0' : ''}${month}-01`))
    }

  const changeFirstYear =
    (year: number) => {
      firstGotoDate(dayjs(`${year}-${firstDate().month() + 1}-01`))
    }

  /* End First */

  /* Start Second */
  const secondGotoDate =
    (date: dayjs.Dayjs) => {
      const newDate = dayjs(formatDate(date, props.displayFormat))
      const reformatDate = dayjs(formatDate(firstDate(), props.displayFormat))
      if (newDate.isSame(reformatDate) || newDate.isBefore(reformatDate)) {
        setFirstDate(previousMonth(date))
      }
      setSecondDate(date)
    }

  const previousMonthSecond = () => {
    secondGotoDate(previousMonth(secondDate()))
  }

  const nextMonthSecond = () => {
    setSecondDate(nextMonth(secondDate()))
  }

  const changeSecondMonth =
    (month: number) => {
      secondGotoDate(dayjs(`${secondDate().year()}-${month < 10 ? '0' : ''}${month}-01`))
    }

  const changeSecondYear =
    (year: number) => {
      secondGotoDate(dayjs(`${year}-${secondDate().month() + 1}-01`))
    }
  /* End Second */

  // UseEffects & UseLayoutEffect
  createEffect(() => {
    const container = containerRef
    const calendarContainer = calendarContainerRef
    const arrow = arrowRef

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (container && calendarContainer && arrow) {
      const detail = container.getBoundingClientRect()
      const screenCenter = window.innerWidth / 2
      const containerCenter = (detail.right - detail.x) / 2 + detail.x

      if (containerCenter > screenCenter) {
        arrow.classList.add('right-0')
        arrow.classList.add('mr-3.5')
        calendarContainer.classList.add('right-0')
      }
    }
  })

  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (props.value?.startDate && props.value.endDate) {
      const startDate = dayjs(props.value.startDate)
      const endDate = dayjs(props.value.endDate)
      const validDate = startDate.isValid() && endDate.isValid()
      const condition =
        validDate && (startDate.isSame(endDate) || startDate.isBefore(endDate))
      if (condition) {
        setPeriod({
          start: formatDate(startDate),
          end: formatDate(endDate)
        })
        setInputText(
          `${formatDate(startDate, props.displayFormat)}${props.asSingle ? '' : ` ${props.separator} ${formatDate(endDate, props.displayFormat)}`
          }`
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (props.value && props.value.startDate === null && props.value.endDate === null) {
      setPeriod({
        start: null,
        end: null
      })
      setInputText('')
    }
  })

  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (props.startFrom && dayjs(props.startFrom).isValid()) {
      const startDate = props.value?.startDate
      const endDate = props.value?.endDate
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (startDate && dayjs(startDate).isValid()) {
        setFirstDate(dayjs(startDate))
        if (!props.asSingle) {
          if (
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            endDate &&
            dayjs(endDate).isValid() &&
            dayjs(endDate).startOf('month').isAfter(dayjs(startDate))
          ) {
            setSecondDate(dayjs(endDate))
          } else {
            setSecondDate(nextMonth(dayjs(startDate)))
          }
        }
      } else {
        setFirstDate(dayjs(props.startFrom))
        setSecondDate(nextMonth(dayjs(props.startFrom)))
      }
    }
  })

  // Variables
  const safePrimaryColor = () => {
    if (COLORS.includes(props.primaryColor)) {
      return props.primaryColor as ColorKeys
    }
    return DEFAULT_COLOR
  }

  const contextValues = () => {
    return {
      asSingle: props.asSingle,
      primaryColor: safePrimaryColor(),
      configs: props.configs,
      calendarContainer: calendarContainerRef,
      arrowContainer: arrowRef,
      hideDatepicker,
      period: period(),
      changePeriod: (newPeriod: Period) => setPeriod(newPeriod),
      dayHover: dayHover(),
      changeDayHover: (newDay: string | null) => setDayHover(newDay),
      inputText: inputText(),
      changeInputText: (newText: string) => setInputText(newText),
      updateFirstDate: (newDate: dayjs.Dayjs) => { firstGotoDate(newDate) },
      changeDatepickerValue: props.onChange,
      showFooter: props.showFooter,
      placeholder: props.placeholder,
      separator: props.separator,
      i18n: props.i18n,
      value: props.value,
      disabled: props.disabled,
      inputClassName: props.inputClassName,
      containerClassName: props.containerClassName,
      toggleClassName: props.toggleClassName,
      toggleIcon: props.toggleIcon,
      readOnly: props.readOnly,
      displayFormat: props.displayFormat,
      minDate: props.minDate,
      maxDate: props.maxDate,
      dateLooking: props.dateLooking,
      disabledDates: props.disabledDates,
      inputId: props.inputId,
      inputName: props.inputName,
      startWeekOn: props.startWeekOn,
      classNames: props.classNames,
      input: inputRef(),
      popoverDirection: props.popoverDirection
    } satisfies DatepickerStore
  }

  const containerClassNameOverload = () => {
    const defaultContainerClassName = 'relative w-full text-gray-700'
    return typeof props.containerClassName === 'function'
      ? props.containerClassName(defaultContainerClassName)
      : typeof props.containerClassName === 'string' && props.containerClassName !== ''
        ? props.containerClassName
        : defaultContainerClassName
  }

  return (
    <DatepickerContext.Provider value={contextValues}>
      <div class={containerClassNameOverload()} ref={containerRef}>
        <Input setContextRef={setInputRef} />

        <div
          class="transition-all ease-out duration-300 absolute z-10 mt-[1px] text-sm lg:text-xs 2xl:text-sm translate-y-4 opacity-0 hidden"
          ref={calendarContainerRef}
        >
          <Arrow ref={arrowRef} />

          <div class="mt-2.5 shadow-sm border border-gray-300 px-1 py-0.5 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600 rounded-lg">
            <div class="flex flex-col lg:flex-row py-2">
              {props.showShortcuts && <Shortcuts />}

              <div
                class={`flex items-stretch flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-1.5 ${props.showShortcuts ? 'md:pl-2' : 'md:pl-1'
                  } pr-2 lg:pr-1`}
              >
                <Calendar
                  date={firstDate()}
                  onClickPrevious={previousMonthFirst}
                  onClickNext={nextMonthFirst}
                  changeMonth={changeFirstMonth}
                  changeYear={changeFirstYear}
                  minDate={props.minDate}
                  maxDate={props.maxDate}
                />

                {props.useRange && (
                  <>
                    <div class="flex items-center">
                      <VerticalDash />
                    </div>

                    <Calendar
                      date={secondDate()}
                      onClickPrevious={previousMonthSecond}
                      onClickNext={nextMonthSecond}
                      changeMonth={changeSecondMonth}
                      changeYear={changeSecondYear}
                      minDate={props.minDate}
                      maxDate={props.maxDate}
                    />
                  </>
                )}
              </div>
            </div>

            {props.showFooter && <Footer />}
          </div>
        </div>
      </div>
    </DatepickerContext.Provider>
  )
}

export default Datepicker
