'use client'

import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
import Datepicker from 'react-tailwindcss-datepicker'
import { useRouter } from 'next/navigation'
import { stringToDate } from '@/legacy/utils/dateUtils'

export default function DatepickerRouter({
  selectedDay,
}: {
  selectedDay: string
}) {
  const router = useRouter()
  const handleDayChange = (newValue: DateValueType) => {
    if (!newValue?.startDate) {
      router.push('/day')
      return
    }

    const dateString = newValue.startDate
    const date = stringToDate(dateString)
    const dayString = date.toISOString().split('T')[0] // TODO: retriggered: use dateUtils when this is understood
    router.push(`/day/${dayString}`)
  }

  return (
    <Datepicker
      asSingle={true}
      useRange={false}
      readOnly={true}
      displayFormat="DD/MM/YYYY"
      value={{
        startDate: selectedDay,
        endDate: selectedDay,
      }}
      onChange={handleDayChange}
    />
  )
}
