import dayjs from 'dayjs'

import { CALENDAR_SIZE, DATE_FORMAT } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import {
  formatDate,
  getDaysInMonth,
  getFirstDayInMonth,
  getFirstDaysInMonth,
  getLastDaysInMonth,
  getNumberOfDay,
  loadLanguageModule,
  nextMonth,
  previousMonth
} from '~/sections/datepicker/helpers'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  RoundedButton
} from '~/sections/datepicker/components/utils'

import Days from '~/sections/datepicker/components/Calendar/Days'
import Months from '~/sections/datepicker/components/Calendar/Months'
import Week from '~/sections/datepicker/components/Calendar/Week'
import Years from '~/sections/datepicker/components/Calendar/Years'

import { type DateType } from '~/sections/datepicker/types'
import { createEffect, createSignal, useContext } from 'solid-js'

type Props = {
  date: dayjs.Dayjs
  minDate?: DateType | null
  maxDate?: DateType | null
  onClickPrevious: () => void
  onClickNext: () => void
  changeMonth: (month: number) => void
  changeYear: (year: number) => void
}

const Calendar = (props: Props) => {
  // Contexts
  const datepickerStore = useContext(DatepickerContext)
  loadLanguageModule(datepickerStore().i18n)

  // States
  const [showMonths, setShowMonths] = createSignal(false)
  const [showYears, setShowYears] = createSignal(false)
  const [year, setYear] = createSignal(props.date.year())
  // Functions
  const previous = () => {
    const {
      startWeekOn
    } = datepickerStore()
    return getLastDaysInMonth(
      previousMonth(props.date),
      getNumberOfDay(getFirstDayInMonth(props.date).ddd, startWeekOn)
    )
  }

  const current = () => {
    return getDaysInMonth(formatDate(props.date))
  }

  const next = () => {
    return getFirstDaysInMonth(
      previousMonth(props.date),
      CALENDAR_SIZE - (previous().length + current().length)
    )
  }

  const hideMonths = () => {
    showMonths() && setShowMonths(false)
  }

  const hideYears = () => {
    showYears() && setShowYears(false)
  }

  const clickMonth =
    (month: number) => {
      setTimeout(() => {
        props.changeMonth(month)
        setShowMonths(!showMonths())
      }, 250)
    }

  const clickYear =
    (year: number) => {
      setTimeout(() => {
        props.changeYear(year)
        setShowYears(!showYears())
      }, 250)
    }

  const clickDay =
    (day: number, month = props.date.month() + 1, year = props.date.year()) => {
      const {
        input,
        changeDatepickerValue,
        hideDatepicker,
        period,
        changeDayHover,
        changePeriod,
        asSingle,
        showFooter
      } = datepickerStore()
      const fullDay = `${year}-${month}-${day}`
      let newStart
      let newEnd = null

      function chosePeriod (start: string, end: string) {
        const ipt = input
        changeDatepickerValue(
          {
            startDate: dayjs(start).format(DATE_FORMAT),
            endDate: dayjs(end).format(DATE_FORMAT)
          },
          ipt
        )
        hideDatepicker()
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (period.start && period.end) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (changeDayHover) {
          changeDayHover(null)
        }
        changePeriod({
          start: null,
          end: null
        })
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if ((!period.start && !period.end) || (period.start && period.end)) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!period.start && !period.end) {
          changeDayHover(fullDay)
        }
        newStart = fullDay
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (asSingle) {
          newEnd = fullDay
          chosePeriod(fullDay, fullDay)
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (period.start && !period.end) {
          // start not null
          // end null
          const condition =
                        dayjs(fullDay).isSame(dayjs(period.start)) ||
                        dayjs(fullDay).isAfter(dayjs(period.start))
          newStart = condition ? period.start : fullDay
          newEnd = condition ? fullDay : period.start
        } else {
          // Start null
          // End not null
          const condition =
                        dayjs(fullDay).isSame(dayjs(period.end)) ||
                        dayjs(fullDay).isBefore(dayjs(period.end))
          newStart = condition ? fullDay : period.start
          newEnd = condition ? period.end : fullDay
        }

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!showFooter) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (newStart && newEnd) {
            chosePeriod(newStart, newEnd)
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!(newEnd && newStart) || showFooter) {
        changePeriod({
          start: newStart,
          end: newEnd
        })
      }
    }

  const clickPreviousDays =
    (day: number) => {
      const newDate = previousMonth(props.date)
      clickDay(day, newDate.month() + 1, newDate.year())
      props.onClickPrevious()
    }

  const clickNextDays =
    (day: number) => {
      const newDate = nextMonth(props.date)
      clickDay(day, newDate.month() + 1, newDate.year())
      props.onClickNext()
    }

  // UseEffects & UseLayoutEffect
  createEffect(() => {
    setYear(props.date.year())
  })

  // Variables
  const calendarData = () => {
    return {
      date: props.date,
      days: {
        previous: previous(),
        current: current(),
        next: next()
      }
    }
  }
  const minYear =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    () => (props.minDate && dayjs(props.minDate).isValid() ? dayjs(props.minDate).year() : null)

  const maxYear =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    () => (props.maxDate && dayjs(props.maxDate).isValid() ? dayjs(props.maxDate).year() : null)

  return (
        <div class="w-full md:w-[296px] md:min-w-[296px]">
            <div class="flex items-center space-x-1.5 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5">
                {!showMonths() && !showYears() && (
                    <div class="flex-none">
                        <RoundedButton roundedFull={true} onClick={props.onClickPrevious}>
                            <ChevronLeftIcon class="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                {showYears() && (
                    <div class="flex-none">
                        <RoundedButton
                            roundedFull={true}
                            onClick={() => {
                              setYear(year() - 12)
                            }}
                        >
                            <DoubleChevronLeftIcon class="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                <div class="flex flex-1 items-center space-x-1.5">
                    <div class="w-1/2">
                        <RoundedButton
                            onClick={() => {
                              setShowMonths(!showMonths())
                              hideYears()
                            }}
                        >
                            <>{calendarData().date.locale(datepickerStore().i18n).format('MMM')}</>
                        </RoundedButton>
                    </div>

                    <div class="w-1/2">
                        <RoundedButton
                            onClick={() => {
                              setShowYears(!showYears())
                              hideMonths()
                            }}
                        >
                            <>{calendarData().date.year()}</>
                        </RoundedButton>
                    </div>
                </div>

                {showYears() && (
                    <div class="flex-none">
                        <RoundedButton
                            roundedFull={true}
                            onClick={() => {
                              setYear(year() + 12)
                            }}
                        >
                            <DoubleChevronRightIcon class="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                {!showMonths() && !showYears() && (
                    <div class="flex-none">
                        <RoundedButton roundedFull={true} onClick={props.onClickNext}>
                            <ChevronRightIcon class="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}
            </div>

            <div class="px-0.5 sm:px-2 mt-0.5 min-h-[285px]">
                {showMonths() && (
                    <Months currentMonth={calendarData().date.month() + 1} clickMonth={clickMonth} />
                )}

                {showYears() && (
                    <Years
                        year={year()}
                        minYear={minYear()}
                        maxYear={maxYear()}
                        currentYear={calendarData().date.year()}
                        clickYear={clickYear}
                    />
                )}

                {!showMonths() && !showYears() && (
                    <>
                        <Week />

                        <Days
                            calendarData={calendarData()}
                            onClickPreviousDays={clickPreviousDays}
                            onClickDay={clickDay}
                            onClickNextDays={clickNextDays}
                        />
                    </>
                )}
            </div>
        </div>
  )
}

export default Calendar
