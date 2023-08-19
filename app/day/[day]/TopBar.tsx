import UserSelector from '@/components/UserSelector'
import DatepickerRouter from '@/components/DatepickerRouter'

export default function TopBar({ selectedDay }: { selectedDay: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
        <div className="flex-1">
          <DatepickerRouter selectedDay={selectedDay} />
        </div>

        <div className="flex justify-end">
          <UserSelector />
        </div>
      </div>
    </>
  )
}
