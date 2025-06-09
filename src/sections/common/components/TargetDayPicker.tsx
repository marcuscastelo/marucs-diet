import {
  setTargetDay,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { type DateValueType } from '~/sections/datepicker/types'
import { getToday, getTodayYYYYMMDD, stringToDate } from '~/shared/utils/date'

export function TargetDayPicker() {
  const handleDayChange = (
    newValue: DateValueType,
    element?: HTMLInputElement | null,
  ) => {
    let dayString: string
    if (newValue === null || newValue.startDate === null) {
      dayString = getTodayYYYYMMDD()
    } else {
      const dateString = newValue.startDate
      const date = stringToDate(dateString)
      dayString = date.toISOString().split('T')[0] as string // TODO:   use dateUtils when this is understood
    }

    setTargetDay(dayString)
    if (element) {
      element.blur() // Remove focus from the datepicker input
      element.value = dayString // Update the input value
    }
  }

  return (
    <Datepicker
      asSingle={true}
      useRange={false}
      readOnly={true}
      displayFormat="DD/MM/YYYY"
      disabledDates={[
        // targetDay(), future days are disabled
        {
          startDate: targetDay(),
          endDate: targetDay(),
        },
        // Disable future dates
        {
          startDate: new Date(getToday().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date('9999-12-31'),
        },
      ]}
      value={{
        startDate: targetDay(),
        endDate: targetDay(),
      }}
      onChange={handleDayChange}
    />
  )
}
