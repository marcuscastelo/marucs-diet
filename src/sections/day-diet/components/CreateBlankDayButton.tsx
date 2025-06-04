import {
  createDayDiet,
  insertDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import { currentUser } from '~/modules/user/application/user'
import { Show } from 'solid-js'
import { smartToastPromise } from '~/shared/toast'
import { formatError } from '~/shared/formatError'

// TODO:   Make meal names editable and persistent by user
const DEFAULT_MEALS = [
  'Café da manhã',
  'Almoço',
  'Lanche',
  'Janta',
  'Pós janta',
].map((name) => createMeal({ name, groups: [] }))

export function CreateBlankDayButton(props: { selectedDay: string }) {
  return (
    <Show when={currentUser()} fallback={<>Usuário não definido</>}>
      {(currentUser) => (
        <button
          class="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
          onClick={() => {
            smartToastPromise(
              insertDayDiet(
                createDayDiet({
                  owner: currentUser().id,
                  target_day: props.selectedDay,
                  meals: DEFAULT_MEALS,
                }),
              ),
              {
                context: 'user-action',
                loading: 'Criando dia...',
                success: 'Dia criado com sucesso',
                error: (error: unknown) =>
                  `Erro ao criar dia: ${formatError(error)}`,
              },
            ).catch(() => {})
          }}
        >
          Criar dia do zero
        </button>
      )}
    </Show>
  )
}
