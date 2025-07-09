import { TargetDayPicker } from '~/sections/common/components/TargetDayPicker'

// TODO: Idea: Use TargetDayPicker on all pages so that the user can change the target day for other features (macroProfiles, etc.)
export default function TopBar() {
  return (
    <>
      <div class="pt-6 flex items-center justify-between gap-4 bg-slate-900 px-4 py-2">
        <div class="flex-1">
          <TargetDayPicker />
        </div>
      </div>
    </>
  )
}
