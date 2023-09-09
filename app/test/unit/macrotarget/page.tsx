'use client'

import { MacroTarget } from '@/app/MacroTargets'
import { MacroProfile } from '@/model/macroProfileModel'

export default function Page() {
  const weight = 100
  const initialProfile: MacroProfile = {
    id: 1,
    owner: 3,
    target_day: new Date(Date.now()),
    gramsPerKgCarbs: 2,
    gramsPerKgProtein: 2,
    gramsPerKgFat: 1,
  }

  return (
    <MacroTarget
      weight={weight}
      profile={initialProfile}
      onSaveMacroProfile={() => alert('Save profile')}
    />
  )
}
