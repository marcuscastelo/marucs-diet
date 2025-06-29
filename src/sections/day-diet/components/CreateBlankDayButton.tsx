import { Show } from 'solid-js'

import {
  createDayDiet,
  insertDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import { currentUser } from '~/modules/user/application/user'
import { Button } from '~/sections/common/components/buttons/Button'

// TODO:   Make meal names editable and persistent by user
const DEFAULT_MEALS = [
  'Café da manhã',
  'Almoço',
  'Lanche',
  'Janta',
  'Pós janta',
].map((name) => createMeal({ name, items: [] }))

export function CreateBlankDayButton(props: { selectedDay: string }) {
  return (
    <Show when={currentUser()} fallback={<>Usuário não definido</>}>
      {(currentUser) => (
        <Button
          variant="primary"
          fullWidth
          class="mt-3 rounded px-4 py-2 font-bold text-white"
          onClick={() => {
            void insertDayDiet(
              createDayDiet({
                owner: currentUser().id,
                target_day: props.selectedDay,
                meals: DEFAULT_MEALS,
              }),
            )
          }}
        >
          Criar dia do zero
        </Button>
      )}
    </Show>
  )
}
