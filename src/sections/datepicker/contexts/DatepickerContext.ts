import type dayjs from 'dayjs'

import { DATE_FORMAT, LANGUAGE, START_WEEK } from '~/sections/datepicker/constants'
import {
  type Configs,
  type Period,
  type DateValueType,
  type DateType,
  type DateRangeType,
  type ClassNamesTypeProp,
  type PopoverDirectionType,
  type ColorKeys
} from '~/sections/datepicker/types'
import { type Accessor, createContext, type JSXElement } from 'solid-js'

export type DatepickerStore = {
  input?: HTMLInputElement | undefined
  asSingle?: boolean
  primaryColor: ColorKeys
  configs?: Configs
  calendarContainer: HTMLDivElement | undefined | null
  arrowContainer: HTMLDivElement | undefined | null
  hideDatepicker: () => void
  period: Period
  changePeriod: (period: Period) => void
  dayHover: string | null
  changeDayHover: (day: string | null) => void
  inputText: string
  changeInputText: (text: string) => void
  updateFirstDate: (date: dayjs.Dayjs) => void
  changeDatepickerValue: (value: DateValueType, e?: HTMLInputElement | null | undefined) => void
  showFooter?: boolean
  placeholder?: string | null
  separator: string
  i18n: string
  value: DateValueType
  disabled?: boolean
  inputClassName?: ((className: string) => string) | string | null
  containerClassName?: ((className: string) => string) | string | null
  toggleClassName?: ((className: string) => string) | string | null
  toggleIcon?: (open: boolean) => JSXElement
  readOnly?: boolean
  startWeekOn?: string | null
  displayFormat: string
  minDate?: DateType | null
  maxDate?: DateType | null
  dateLooking?: 'forward' | 'backward' | 'middle'
  disabledDates?: DateRangeType[] | null
  inputId?: string
  inputName?: string
  classNames?: ClassNamesTypeProp
  popoverDirection?: PopoverDirectionType
}

const DatepickerContext = createContext<Accessor<DatepickerStore>>(() => ({
  input: undefined,
  primaryColor: 'blue',
  configs: undefined,
  calendarContainer: null,
  arrowContainer: null,
  period: { start: null, end: null },
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  changePeriod: _period => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hideDatepicker: () => {},
  dayHover: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  changeDayHover: (_day: string | null) => {},
  inputText: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  changeInputText: _text => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  updateFirstDate: _date => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  changeDatepickerValue: (_value: DateValueType, _e: HTMLInputElement | null | undefined) => {},
  showFooter: false,
  value: null,
  i18n: LANGUAGE,
  disabled: false,
  inputClassName: '',
  containerClassName: '',
  toggleClassName: '',
  readOnly: false,
  displayFormat: DATE_FORMAT,
  minDate: null,
  maxDate: null,
  dateLooking: 'forward',
  disabledDates: null,
  inputId: undefined,
  inputName: undefined,
  startWeekOn: START_WEEK,
  toggleIcon: undefined,
  classNames: undefined,
  popoverDirection: undefined,
  separator: '~'
}))

export default DatepickerContext
