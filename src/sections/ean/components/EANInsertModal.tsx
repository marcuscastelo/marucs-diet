import { createEffect, createSignal, Suspense } from 'solid-js'

import { type Food } from '~/modules/diet/food/domain/food'
import { Button } from '~/sections/common/components/buttons/Button'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { Modal } from '~/sections/common/components/Modal'
import { EANReader } from '~/sections/ean/components/EANReader'
import { lazyImport } from '~/shared/solid/lazyImport'

const { EANSearch } = lazyImport(
  () => import('~/sections/ean/components/EANSearch'),
  ['EANSearch'],
)

export type EANInsertModalProps = {
  onSelect: (apiFood: Food) => void
  /** Callback to close the modal. If not provided, uses legacy useModalContext */
  onClose?: () => void
  /** Whether the modal is visible. If not provided, uses legacy useModalContext */
  visible: boolean
}

let currentId = 1

const EANInsertModal = (props: EANInsertModalProps) => {
  const handleCloseModal = () => {
    props.onClose?.()
  }

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

  // Auto-select food when it is set to avoid user clicking twice
  createEffect(() => {
    if (food() !== null) {
      handleSelect()
    }
  })

  return (
    <Modal visible={props.visible} onClose={handleCloseModal}>
      <Modal.Header
        title="Pesquisar por código de barras"
        onClose={handleCloseModal}
      />
      <Modal.Content>
        {/*
          // TODO:   Apply Show when visible for all modals?
        */}
        <EANReader
          enabled={props.visible}
          id={`EAN-reader-${currentId++}`}
          onScanned={setEAN}
        />
        <Suspense fallback={<LoadingRing />}>
          <EANSearch EAN={EAN} setEAN={setEAN} food={food} setFood={setFood} />
        </Suspense>
      </Modal.Content>
      <Modal.Footer>
        <Button
          onClick={(e) => {
            e.preventDefault()
            handleCloseModal()
          }}
        >
          Cancelar
        </Button>
        <Button
          class="btn-primary"
          disabled={food() === null}
          onClick={handleSelect}
        >
          Aplicar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EANInsertModal
