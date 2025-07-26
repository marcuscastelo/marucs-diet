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
  onClose?: () => void
}

let currentId = 1

export const EANInsertModal = (props: EANInsertModalProps) => {
  const [EAN, setEAN] = createSignal<string>('')
  const [food, setFood] = createSignal<Food | null>(null)
  const [isScanning, setIsScanning] = createSignal(true)

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

    // Stop scanning to unmount EANReader and trigger camera cleanup
    setIsScanning(false)

    // Allow time for component cleanup before calling onSelect
    setTimeout(() => {
      props.onSelect(food_)
    }, 100)
  }

  const handleCancel = () => {
    setIsScanning(false)

    // Allow time for component cleanup before closing
    setTimeout(() => {
      props.onClose?.()
    }, 100)
  }

  // Auto-select food when it is set to avoid user clicking twice
  createEffect(() => {
    if (food() !== null) {
      handleSelect()
    }
  })

  return (
    <div class="ean-insert-modal-content">
      {isScanning() && (
        <EANReader id={`EAN-reader-${currentId++}`} onScanned={setEAN} />
      )}
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
