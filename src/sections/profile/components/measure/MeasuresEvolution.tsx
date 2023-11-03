import { type Loadable } from '@/legacy/utils/loadable'
import { type Measure, createMeasure } from '@/modules/measure/domain/measure'
import { fetchUserMeasures, insertMeasure } from '@/legacy/controllers/measures'
import { MeasureChart } from '@/sections/profile/components/measure/MeasureChart'
import { MeasureView } from '@/sections/profile/components/measure/MeasureView'
import { useFloatFieldOld } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { For, createEffect, createSignal } from 'solid-js'
import { currentUserId } from '@/modules/user/application/user'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export function MeasuresEvolution (props: { onSave: () => void }) {
  // TODO: Remove `measures` state and use use cases instead
  const [measures, setMeasures] = createSignal<Loadable<Measure[]>>({
    loading: true
  })
  const heightField = useFloatFieldOld()
  const waistField = useFloatFieldOld()
  const hipField = useFloatFieldOld()
  const neckField = useFloatFieldOld()

  const handleRefetchMeasures = () => {
    const userId = currentUserId()
    if (userId === null) {
      throw new Error('User is null')
    }
    fetchUserMeasures(userId).then((measures) =>
      setMeasures({ loading: false, errored: false, data: measures })
    ).catch((error) => {
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
              onFocus={(event) => { event.target.select() }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Cintura</span>
            <FloatInput
              field={waistField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => { event.target.select() }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Quadril</span>
            <FloatInput
              field={hipField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => { event.target.select() }}
            />
          </div>
          <div class="flex mb-3">
            <span class="w-1/4 text-center my-auto text-lg">Pescoço</span>
            <FloatInput
              field={neckField}
              class="input px-0 pl-5 text-xl"
              style={{ width: '100%' }}
              onFocus={(event) => { event.target.select() }}
            />
          </div>

          <button
            class="btn btn-primary no-animation w-full"
            onClick={() => {
              if (
                !heightField.value ||
                !waistField.value ||
                !hipField.value ||
                !neckField.value
              ) {
                alert('Medidas inválidas') // TODO: Change all alerts with ConfirmModal
                return
              }
              const userId = currentUserId()
              if (userId === null) {
                throw new Error('User is null')
              }
              insertMeasure(
                createMeasure({
                  owner: userId,
                  height: heightField.value() ?? 0,
                  waist: waistField.value() ?? 0,
                  hip: hipField.value() ?? 0,
                  neck: neckField.value() ?? 0,
                  target_timestamp: new Date(Date.now())
                })
              ).then(() => {
                handleRefetchMeasures()
                props.onSave()
              }).catch((error) => {
                console.error(error)
                alert('Erro ao salvar') // TODO: Change all alerts with ConfirmModal
              })
            }}
          >
            Adicionar peso
          </button>
        </div>
        <MeasureChart measures={loadedMeasures()} />
        <div class="mx-5 lg:mx-20 pb-10">
          <For each={[...loadedMeasures()].reverse().slice(0, 10)}>
            {(measure) => (
              <MeasureView
                measure={measure}
                onRefetchMeasures={handleRefetchMeasures}
                onSave={props.onSave}
              />
            )
            }
          </For>
          {loadedMeasures().length === 0 && 'Não há pesos registrados'}
        </div>
      </div>
    </>
  )
}
