import { createResource, For, Show } from 'solid-js'

import {
  fetchUserBodyMeasures,
  insertBodyMeasure,
} from '~/modules/measure/application/measure'
import { createNewBodyMeasure } from '~/modules/measure/domain/measure'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { useFloatField } from '~/sections/common/hooks/useField'
import { BodyMeasureChart } from '~/sections/profile/measure/components/BodyMeasureChart'
import { BodyMeasureView } from '~/sections/profile/measure/components/BodyMeasureView'
import { formatError } from '~/shared/formatError'

export function BodyMeasuresEvolution() {
  const [bodyMeasuresResource, { refetch }] = createResource(
    currentUserId,
    fetchUserBodyMeasures,
  )
  const bodyMeasures = () => bodyMeasuresResource() ?? []

  const heightField = useFloatField()
  const waistField = useFloatField()
  const hipField = useFloatField()
  const neckField = useFloatField()

  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
        <h5 class={'mx-auto mb-5 text-center text-3xl font-bold'}>
          Progresso das medidas
        </h5>
        <div class="mx-5 lg:mx-20 pb-10">
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Altura</span>
            <FloatInput
              field={heightField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => {
                event.target.select()
              }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Cintura</span>
            <FloatInput
              field={waistField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => {
                event.target.select()
              }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Quadril</span>
            <FloatInput
              field={hipField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => {
                event.target.select()
              }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Pescoço</span>
            <FloatInput
              field={neckField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => {
                event.target.select()
              }}
            />
          </div>

          <button
            class="btn cursor-pointer uppercase btn-primary no-animation w-full"
            onClick={() => {
              if (
                heightField.value() === undefined ||
                waistField.value() === undefined ||
                hipField.value() === undefined ||
                neckField.value() === undefined
              ) {
                showError('Medidas inválidas: preencha todos os campos')
                return
              }
              const userId = currentUserId()

              insertBodyMeasure(
                createNewBodyMeasure({
                  owner: userId,
                  height: heightField.value() ?? 0,
                  waist: waistField.value() ?? 0,
                  hip: hipField.value() ?? 0,
                  neck: neckField.value() ?? 0,
                  targetTimestamp: new Date(Date.now()),
                }),
              )
                .then(refetch)
                .catch((error) => {
                  console.error(error)
                  showError(`Erro ao adicionar medida: ${formatError(error)}`)
                })
            }}
          >
            Adicionar medidas
          </button>
        </div>

        <Show
          when={!bodyMeasuresResource.loading}
          fallback={
            <div class="text-center text-gray-400 py-8">
              Carregando medidas...
            </div>
          }
        >
          <BodyMeasureChart measures={bodyMeasures()} />
          <div class="mx-5 lg:mx-20 pb-10">
            <For each={[...bodyMeasures()].reverse().slice(0, 10)}>
              {(bodyMeasure) => (
                <BodyMeasureView
                  measure={bodyMeasure}
                  onRefetchBodyMeasures={refetch}
                />
              )}
            </For>
            {bodyMeasures().length === 0 && 'Não há pesos registrados'}
          </div>
        </Show>
      </div>
    </>
  )
}
