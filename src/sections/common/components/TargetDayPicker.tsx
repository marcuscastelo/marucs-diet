import { getTodayYYYYMMDD, stringToDate } from '~/shared/utils/date'
import {
  setTargetDay,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { type DateValueType } from '~/sections/datepicker/types'

export function TargetDayPicker() {
  const handleDayChange = (newValue: DateValueType) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!newValue?.startDate) {
      setTargetDay(getTodayYYYYMMDD())
      return
    }

    const dateString = newValue.startDate
    const date = stringToDate(dateString)
    const dayString = date.toISOString().split('T')[0] // TODO:   use dateUtils when this is understood
    setTargetDay(dayString)
  }

  return (
    <Datepicker
      asSingle={true}
      useRange={false}
      readOnly={true}
      displayFormat="DD/MM/YYYY"
      value={{
        startDate: targetDay(),
        endDate: targetDay(),
      }}
      onChange={handleDayChange}
    />
  )
}
