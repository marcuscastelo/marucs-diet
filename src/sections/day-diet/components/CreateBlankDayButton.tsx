'use client'

import {
  createDayDiet,
  insertDayDiet,
} from '@/modules/diet/day-diet/application/dayDiet'
import { createMeal } from '@/modules/diet/meal/domain/meal'
import { currentUser } from '@/modules/user/application/user'

// TODO: Make meal names editable and persistent by user
const DEFAULT_MEALS = [
  'Café da manhã',
  'Almoço',
  'Lanche',
  'Janta',
  'Pós janta',
].map((name) => createMeal({ name, groups: [] }))

export default function CreateBlankDayButton({
  selectedDay,
}: {
  selectedDay: string
}) {
  const user = currentUser.value
  if (user === null) {
    throw new Error(`User is null`)
  }
  return (
    <button
      className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
      onClick={() => {
        insertDayDiet(
          createDayDiet({
            owner: user.id,
            target_day: selectedDay,
            meals: DEFAULT_MEALS,
          }),
        )
      }}
    >
      Criar dia do zero
    </button>
  )
}
