'use client'

import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
import Datepicker from 'react-tailwindcss-datepicker'
import UserSelector from '@/app/UserSelector'
import { useRouter } from 'next/navigation'
import { stringToDate } from '@/utils/dateUtils'

export default function TopBar({ selectedDay }: { selectedDay: string }) {
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
    <>
      <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
        <div className="flex-1">
          <Datepicker
            asSingle={true}
            useRange={false}
            readOnly={true}
            value={{
              startDate: selectedDay,
              endDate: selectedDay,
            }}
            onChange={handleDayChange}
          />
        </div>

        <div className="flex justify-end">
          <UserSelector />
        </div>
      </div>
    </>
  )
}
