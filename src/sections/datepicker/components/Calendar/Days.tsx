import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

import { For, useContext } from 'solid-js'
import { BG_COLOR, TEXT_COLOR } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import { classNames as cn, formatDate, nextMonth, previousMonth } from '~/sections/datepicker/helpers'
import { type Period } from '~/sections/datepicker/types'

dayjs.extend(isBetween)

type Props = {
  calendarData: {
    date: dayjs.Dayjs
    days: {
      previous: number[]
      current: number[]
      next: number[]
    }
  }
  onClickPreviousDays: (day: number) => void
  onClickDay: (day: number) => void
  onClickNextDays: (day: number) => void
}

const Days = (props: Props) => {
  // Contexts
  const datepickerStore = useContext(DatepickerContext)

  // Functions
  const currentDateClass =
    (item: number) => {
      const { primaryColor } = datepickerStore()
      const itemDate = `${props.calendarData.date.year()}-${props.calendarData.date.month() + 1}-${item >= 10 ? item : '0' + item
        }`
      if (formatDate(dayjs()) === formatDate(dayjs(itemDate))) { return TEXT_COLOR['500'][primaryColor as keyof (typeof TEXT_COLOR)['500']] }
      return ''
    }

  const activeDateData =
    (day: number) => {
      const {
        primaryColor,
        period,
        dayHover
      } = datepickerStore()

      const fullDay = `${props.calendarData.date.year()}-${props.calendarData.date.month() + 1}-${day}`
      let className = ''

      if (dayjs(fullDay).isSame(period.start) && dayjs(fullDay).isSame(period.end)) {
        className = ` ${BG_COLOR['500'][primaryColor]} text-white font-medium rounded-full`
      } else if (dayjs(fullDay).isSame(period.start)) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        className = ` ${BG_COLOR['500'][primaryColor]} text-white font-medium ${dayjs(fullDay).isSame(dayHover) && !period.end
          ? 'rounded-full'
          : 'rounded-l-full'
          }`
      } else if (dayjs(fullDay).isSame(period.end)) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        className = ` ${BG_COLOR['500'][primaryColor]} text-white font-medium ${dayjs(fullDay).isSame(dayHover) && !period.start
          ? 'rounded-full'
          : 'rounded-r-full'
          }`
      }

      return {
        active: dayjs(fullDay).isSame(period.start) || dayjs(fullDay).isSame(period.end),
        className
      }
    }

  const hoverClassByDay =
    (day: number) => {
      const {
        primaryColor,
        period,
        dayHover
      } = datepickerStore()
      let className = currentDateClass(day)
      const fullDay = `${props.calendarData.date.year()}-${props.calendarData.date.month() + 1}-${day >= 10 ? day : '0' + day
        }`

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (period.start && period.end) {
        if (dayjs(fullDay).isBetween(period.start, period.end, 'day', '[)')) {
          return ` ${BG_COLOR['100'][primaryColor]} ${currentDateClass(
            day
          )} dark:bg-white/10`
        }
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!dayHover) {
        return className
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (period.start && dayjs(fullDay).isBetween(period.start, dayHover, 'day', '[)')) {
        className = ` ${BG_COLOR['100'][primaryColor]} ${currentDateClass(
          day
        )} dark:bg-white/10`
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (period.end && dayjs(fullDay).isBetween(dayHover, period.end, 'day', '[)')) {
        className = ` ${BG_COLOR['100'][primaryColor]} ${currentDateClass(
          day
        )} dark:bg-white/10`
      }

      if (dayHover === fullDay) {
        const bgColor = BG_COLOR['500'][primaryColor]
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        className = ` transition-all duration-500 text-white font-medium ${bgColor} ${period.start ? 'rounded-r-full' : 'rounded-l-full'
          }`
      }

      return className
    }

  const isDateTooEarly =
    (day: number, type: 'current' | 'previous' | 'next') => {
      const {
        minDate
      } = datepickerStore()
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!minDate) {
        return false
      }
      const object = {
        previous: previousMonth(props.calendarData.date),
        current: props.calendarData.date,
        next: nextMonth(props.calendarData.date)
      }
      const newDate = object[type as keyof typeof object]
      const formattedDate = newDate.set('date', day)
      return dayjs(formattedDate).isSame(dayjs(minDate), 'day')
        ? false
        : dayjs(formattedDate).isBefore(dayjs(minDate))
    }

  const isDateTooLate =
    (day: number, type: 'current' | 'previous' | 'next') => {
      const {
        maxDate
      } = datepickerStore()
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!maxDate) {
        return false
      }
      const object = {
        previous: previousMonth(props.calendarData.date),
        current: props.calendarData.date,
        next: nextMonth(props.calendarData.date)
      }
      const newDate = object[type as keyof typeof object]
      const formattedDate = newDate.set('date', day)
      return dayjs(formattedDate).isSame(dayjs(maxDate), 'day')
        ? false
        : dayjs(formattedDate).isAfter(dayjs(maxDate))
    }

  const isDateDisabled =
    (day: number, type: 'current' | 'previous' | 'next') => {
      const {
        disabledDates
      } = datepickerStore()
      if (isDateTooEarly(day, type) || isDateTooLate(day, type)) {
        return true
      }
      const object = {
        previous: previousMonth(props.calendarData.date),
        current: props.calendarData.date,
        next: nextMonth(props.calendarData.date)
      }
      const newDate = object[type as keyof typeof object]
      const formattedDate = `${newDate.year()}-${newDate.month() + 1}-${day >= 10 ? day : '0' + day
        }`

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!disabledDates || (Array.isArray(disabledDates) && (disabledDates.length === 0))) {
        return false
      }

      let matchingCount = 0
      disabledDates?.forEach(dateRange => {
        if (
          dayjs(formattedDate).isAfter(dateRange.startDate) &&
          dayjs(formattedDate).isBefore(dateRange.endDate)
        ) {
          matchingCount++
        }
        if (
          dayjs(formattedDate).isSame(dateRange.startDate) ||
          dayjs(formattedDate).isSame(dateRange.endDate)
        ) {
          matchingCount++
        }
      })
      return matchingCount > 0
    }

  const buttonClass =
    (day: number, type: 'current' | 'next' | 'previous') => {
      const baseClass = 'flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10'
      if (type === 'current') {
        return cn(
          baseClass,
          !activeDateData(day).active
            ? hoverClassByDay(day)
            : activeDateData(day).className,
          isDateDisabled(day, type) && 'line-through'
        )
      }
      return cn(baseClass, isDateDisabled(day, type) && 'line-through', 'text-gray-400')
    }

  const checkIfHoverPeriodContainsDisabledPeriod =
    (hoverPeriod: Period) => {
      const {
        disabledDates
      } = datepickerStore()
      if (!Array.isArray(disabledDates)) {
        return false
      }
      for (let i = 0; i < disabledDates.length; i++) {
        if (
          dayjs(hoverPeriod.start).isBefore(disabledDates[i]?.startDate) &&
          dayjs(hoverPeriod.end).isAfter(disabledDates[i]?.endDate)
        ) {
          return true
        }
      }
      return false
    }
  const getMetaData = () => {
    return {
      previous: previousMonth(props.calendarData.date),
      current: props.calendarData.date,
      next: nextMonth(props.calendarData.date)
    }
  }

  const hoverDay =
    (day: number, type: string) => {
      const {
        period,
        changePeriod,
        changeDayHover
      } = datepickerStore()
      const object = getMetaData()
      const newDate = object[type as keyof typeof object]
      const newHover = `${newDate.year()}-${newDate.month() + 1}-${day >= 10 ? day : '0' + day
        }`

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (period.start && !period.end) {
        const hoverPeriod = { ...period, end: newHover }
        if (dayjs(newHover).isBefore(dayjs(period.start))) {
          hoverPeriod.start = newHover
          hoverPeriod.end = period.start
          if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
            changePeriod({
              start: null,
              end: period.start
            })
          }
        }
        if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
          changeDayHover(newHover)
        }
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!period.start && period.end) {
        const hoverPeriod = { ...period, start: newHover }
        if (dayjs(newHover).isAfter(dayjs(period.end))) {
          hoverPeriod.start = period.end
          hoverPeriod.end = newHover
          if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
            changePeriod({
              start: period.end,
              end: null
            })
          }
        }
        if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
          changeDayHover(newHover)
        }
      }
    }

  const handleClickDay =
    (day: number, type: 'previous' | 'current' | 'next') => {
      const {
        period,
        disabledDates,
        dayHover
      } = datepickerStore()
      function continueClick () {
        if (type === 'previous') {
          props.onClickPreviousDays(day)
        }

        if (type === 'current') {
          props.onClickDay(day)
        }

        if (type === 'next') {
          props.onClickNextDays(day)
        }
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (disabledDates?.length) {
        const object = getMetaData()
        const newDate = object[type as keyof typeof object]
        const clickDay = `${newDate.year()}-${newDate.month() + 1}-${day >= 10 ? day : '0' + day
          }`

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (period.start && !period.end) {
          dayjs(clickDay).isSame(dayHover) && continueClick()
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        } else if (!period.start && period.end) {
          dayjs(clickDay).isSame(dayHover) && continueClick()
        } else {
          continueClick()
        }
      } else {
        continueClick()
      }
    }

  return (
    <div class="grid grid-cols-7 gap-y-0.5 my-1">
      <For each={props.calendarData.days.previous}>

        {((item, _index) => (
          <button
            type="button"

            disabled={isDateDisabled(item, 'previous')}
            class={`${buttonClass(item, 'previous')}`}
            onClick={() => { handleClickDay(item, 'previous') }}
            onMouseOver={() => {
              hoverDay(item, 'previous')
            }}
          >
            {item}
          </button>
        ))}
      </For>

      <For each={props.calendarData.days.current}>
        {((item, _index) => (
          <button
            type="button"

            disabled={isDateDisabled(item, 'current')}
            class={`${buttonClass(item, 'current')}`}
            onClick={() => { handleClickDay(item, 'current') }}
            onMouseOver={() => {
              hoverDay(item, 'current')
            }}
          >
            {item}
          </button>
        ))}
      </For>

      <For each={props.calendarData.days.next}>
        {((item, _index) => (
          <button
            type="button"

            disabled={isDateDisabled(item, 'next')}
            class={`${buttonClass(item, 'next')}`}
            onClick={() => { handleClickDay(item, 'next') }}
            onMouseOver={() => {
              hoverDay(item, 'next')
            }}
          >
            {item}
          </button>
        ))}
      </For>
    </div>
  )
}

export default Days
