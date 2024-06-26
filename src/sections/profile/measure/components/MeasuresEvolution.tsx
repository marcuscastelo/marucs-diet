import { type Loadable } from '~/legacy/utils/loadable'
import { type Measure, createMeasure } from '~/modules/measure/domain/measure'
import { MeasureChart } from '~/sections/profile/measure/components/MeasureChart'
import { MeasureView } from '~/sections/profile/measure/components/MeasureView'
import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { For, createEffect, createSignal } from 'solid-js'
import { currentUserId } from '~/modules/user/application/user'
import {
  fetchUserMeasures,
  insertMeasure,
} from '~/modules/measure/application/measure'
import toast from 'solid-toast'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export function MeasuresEvolution() {
  // TODO: Remove `measures` signal and use use cases instead
  const [measures, setMeasures] = createSignal<Loadable<readonly Measure[]>>({
    loading: true,
  })
  const heightField = useFloatField()
  const waistField = useFloatField()
  const hipField = useFloatField()
  const neckField = useFloatField()

  const handleRefetchMeasures = () => {
    const userId = currentUserId()
    if (userId === null) {
      throw new Error('User is null')
    }
    fetchUserMeasures(userId)
      .then((measures) =>
        setMeasures({ loading: false, errored: false, data: measures }),
      )
      .catch((error) => {
        console.error(error)
        setMeasures({ loading: false, errored: true, error })
      })
  }

  createEffect(() => {
    handleRefetchMeasures()
  })

  const loadedMeasures = () => {
    const measures_ = measures()
    if (measures_.loading || measures_.errored) {
      return []
    }
    return measures_.data
  }

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
            class="btn btn-primary no-animation w-full"
            onClick={() => {
              if (
                heightField.value() === undefined ||
                waistField.value() === undefined ||
                hipField.value() === undefined ||
                neckField.value() === undefined
              ) {
                toast.error('Medidas inválidas: preencha todos os campos')
                return
              }
              const userId = currentUserId()

              const afterInsert = () => {
                handleRefetchMeasures()
              }
              insertMeasure(
                createMeasure({
                  owner: userId,
                  height: heightField.value() ?? 0,
                  waist: waistField.value() ?? 0,
                  hip: hipField.value() ?? 0,
                  neck: neckField.value() ?? 0,
                  target_timestamp: new Date(Date.now()),
                }),
              )
                .then(afterInsert)
                .catch((error) => {
                  console.error(error)
                  toast.error(
                    'Erro ao adicionar peso: \n' +
                      JSON.stringify(error, null, 2),
                  )
                })
            }}
          >
            Adicionar medidas
          </button>
        </div>
        <MeasureChart measures={loadedMeasures()} />
        <div class="mx-5 lg:mx-20 pb-10">
          <For each={[...loadedMeasures()].reverse().slice(0, 10)}>
            {(measure) => (
              <MeasureView
                measure={measure}
                onRefetchMeasures={handleRefetchMeasures}
              />
            )}
          </For>
          {loadedMeasures().length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}
