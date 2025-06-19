import { type Accessor, createEffect, For, type Setter, Show } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { lazyImport } from '~/shared/solid/lazyImport'

const { PreviousDayCard } = lazyImport(
  () => import('~/sections/day-diet/components/PreviousDayCard'),
  ['PreviousDayCard'],
)

type CopyLastDayModalProps = {
  previousDays: DayDiet[]
  copying: boolean
  copyingDay: string | null
  onCopy: (day: string) => void
  open: Accessor<boolean>
  setOpen: Setter<boolean>
}

export function CopyLastDayModal(props: CopyLastDayModalProps) {
  createEffect(() => {
    console.log(
      'Debug: previousDays passed to CopyLastDayModal:',
      props.previousDays,
    )
  })

  return (
    <ModalContextProvider visible={props.open} setVisible={props.setOpen}>
      <Modal>
        <div class="flex flex-col gap-4 min-h-[500px]">
          <h2 class="text-lg font-bold">
            Selecione um dia anterior para copiar
          </h2>
          <Show
            when={props.previousDays.length > 0}
            fallback={
              <div class="text-gray-500">
                Nenhum dia com dieta registrada disponível para copiar.
              </div>
            }
          >
            <div class="flex flex-col gap-4 max-h-96 overflow-y-auto">
              <For each={props.previousDays}>
                {(dayDiet) => (
                  <PreviousDayCard
                    dayDiet={dayDiet}
                    copying={props.copying}
                    copyingDay={props.copyingDay}
                    onCopy={props.onCopy}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </Modal>
    </ModalContextProvider>
  )
}
