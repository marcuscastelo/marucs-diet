// TODO: use Datepicker component
// import { DateTimePicker } from 'date-time-picker-solid'
// import { stringToDate } from '@/legacy/utils/dateUtils'
// import { createEffect, createSignal } from 'solid-js'

// interface IPropsValue {
//   activeView: string
//   startDate?: Date
//   endDate?: Date
//   currentDate?: Date
//   dateRangeDifference: number
//   date: string
//   month: string
//   year: string
//   day: string
//   time: string
//   currentWeekStartDate: Date
//   currentWeekEndDate: Date
//   setCalendarState: (props: boolean) => void
// }

// export default function DatepickerRouter (props: {
//   selectedDay: string
// }) {
//   const [innerSelectedDay, setInnerSelectedDay] = createSignal<string | undefined>(props.selectedDay)

//   const handleDayChange = (newValue: IPropsValue) => {
//     setInnerSelectedDay(newValue.startDate?.toString())
//   }

//   createEffect(() => {
//     const dateString = innerSelectedDay()

//     if (dateString === undefined) {
//       alert('TODO: Redirect to /diet')
//       return
//     }

//     const date = stringToDate(dateString)
//     const dayString = date.toISOString().split('T')[0] // TODO: retriggered: use dateUtils when this is understood

//     alert('TODO: Redirect to /diet/' + dayString)
//   }, { defer: true })

//   return (
//     <DateTimePicker
//       currentDate={props.selectedDay}
//       calendarResponse={handleDayChange}
//       closeOnSelect={true}
//     />
//   )
// }
