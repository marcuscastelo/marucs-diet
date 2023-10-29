'use client'

import { useUserContext } from '@/sections/user/context/UserContext'
import {
  createDayDiet,
  insertDayDiet,
} from '@/modules/diet/day-diet/application/dayDiet'
import { createMeal } from '@/src/modules/diet/meal/domain/meal'

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
  const { user } = useUserContext()

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
