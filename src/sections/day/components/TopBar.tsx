import DatepickerRouter from '@/sections/common/components/DatepickerRouter'
// TODO: make day/TopBar a common component
export default function TopBar({ selectedDay }: { selectedDay: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
        <div className="flex-1">
          <DatepickerRouter selectedDay={selectedDay} />
        </div>
      </div>
    </>
  )
}
