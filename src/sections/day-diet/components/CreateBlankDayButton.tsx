import { Show } from 'solid-js'

import {
  createDayDiet,
  insertDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import { currentUser } from '~/modules/user/application/user'
import { Button } from '~/sections/common/components/buttons/Button'
import { generateId } from '~/shared/utils/idUtils'

// TODO:   Make meal names editable and persistent by user
const DEFAULT_MEALS = [
  'Café da manhã',
  'Almoço',
  'Lanche',
  'Janta',
  'Pós janta',
].map((name) => promoteMeal(createNewMeal({ name, items: [] }), generateId()))

export function CreateBlankDayButton(props: { selectedDay: string }) {
  return (
    <Show when={currentUser()} fallback={<>Usuário não definido</>}>
      {(currentUser) => (
        <Button
          class="btn-primary w-full mt-3 rounded px-4 py-2 font-bold text-white"
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
