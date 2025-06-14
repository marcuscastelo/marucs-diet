import { createEffect, createSignal, onMount } from 'solid-js'

import { type Food } from '~/modules/diet/food/domain/food'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { EANReader } from '~/sections/ean/components/EANReader'
import EANSearch from '~/sections/ean/components/EANSearch'

export type EANInsertModalProps = {
  onSelect: (apiFood: Food) => void
}

let currentId = 1

const EANInsertModal = (props: EANInsertModalProps) => {
  const { visible, setVisible } = useModalContext()

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

  onMount(() => {
    setVisible(false)
  })

  return (
    <Modal>
      <Modal.Header title="Pesquisar por código de barras" />
      <Modal.Content>
        {/*
          // TODO:   Apply Show when visible for all modals?
        */}
        <EANReader
          enabled={visible()}
          id={`EAN-reader-${currentId++}`}
          onScanned={setEAN}
        />
        <EANSearch EAN={EAN} setEAN={setEAN} food={food} setFood={setFood} />
      </Modal.Content>
      <Modal.Footer>
        <button
          class="btn cursor-pointer uppercase"
          onClick={(e) => {
            e.preventDefault()
            setVisible(false)
          }}
        >
          Cancelar
        </button>
        <button
          class="btn-primary btn cursor-pointer uppercase"
          disabled={food() === null}
          onClick={handleSelect}
        >
          Aplicar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default EANInsertModal
