import { createEffect, createSignal, Suspense } from 'solid-js'

import { type Food } from '~/modules/diet/food/domain/food'
import { Button } from '~/sections/common/components/buttons/Button'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { EANReader } from '~/sections/ean/components/EANReader'
import { lazyImport } from '~/shared/solid/lazyImport'

const { EANSearch } = lazyImport(
  () => import('~/sections/ean/components/EANSearch'),
  ['EANSearch'],
)

export type EANInsertModalProps = {
  onSelect: (apiFood: Food) => void
  /** Callback to close the modal */
  onClose?: () => void
}

let currentId = 1

export const EANInsertModal = (props: EANInsertModalProps) => {
  const [EAN, setEAN] = createSignal<string>('')
  const [food, setFood] = createSignal<Food | null>(null)

  const handleSelect = (
    e?: MouseEvent & {
      currentTarget: HTMLButtonElement
      target: Element
    },
  ) => {
    e?.preventDefault()

    const food_ = food()
    if (food_ === null) {
      console.warn('Ignoring submit because food is null')
      return
    }

    props.onSelect(food_)
  }

  const handleCancel = () => {
    props.onClose?.()
  }

  // Auto-select food when it is set to avoid user clicking twice
  createEffect(() => {
    if (food() !== null) {
      handleSelect()
    }
  })

  return (
    <div class="ean-insert-modal-content">
      <EANReader id={`EAN-reader-${currentId++}`} onScanned={setEAN} />
      <Suspense fallback={<LoadingRing />}>
        <EANSearch EAN={EAN} setEAN={setEAN} food={food} setFood={setFood} />
      </Suspense>

      <div class="modal-action mt-4">
        <Button onClick={handleCancel}>Cancelar</Button>
        <Button
          class="btn-primary"
          disabled={food() === null}
          onClick={handleSelect}
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}
