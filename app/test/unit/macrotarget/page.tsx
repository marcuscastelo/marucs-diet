'use client'

import MacroTarget, { MacroProfile } from '@/app/MacroTargets'

export default function Page() {
  const weight = 100
  const initialProfile: MacroProfile = {
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
