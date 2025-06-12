import { Show } from 'solid-js'

import {
  createDayDiet,
  insertDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import { currentUser } from '~/modules/user/application/user'
import { transformMeal } from '~/shared/domainTransformers/mealTransformers'

// TODO:   Make meal names editable and persistent by user
const DEFAULT_MEALS = [
  'Café da manhã',
  'Almoço',
  'Lanche',
  'Janta',
  'Pós janta',
].map((name, idx) => createMeal({ id: idx + 1, name, groups: [] }))

export function CreateBlankDayButton(props: { selectedDay: string }) {
  return (
    <Show when={currentUser()} fallback={<>Usuário não definido</>}>
      {(currentUser) => (
        <button
          class="btn-primary btn cursor-pointer uppercase mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
          onClick={() => {
            void insertDayDiet(
              createDayDiet({
                owner: currentUser().id,
                target_day: props.selectedDay,
                meals: DEFAULT_MEALS.map(transformMeal),
              }),
            )
          }}
        >
          Criar dia do zero
        </button>
      )}
    </Show>
  )
}
