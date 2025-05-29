import { type Food } from '~/modules/diet/food/domain/food'
import {
  Modal,
} from '~/sections/common/components/Modal'
import { BarCodeReader } from '~/sections/barcode/components/BarCodeReader'
import BarCodeSearch from '~/sections/barcode/components/BarCodeSearch'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { createEffect, createSignal, onMount } from 'solid-js'

export type BarCodeInsertModalProps = {
  onSelect: (apiFood: Food) => void
}

let currentId = 1

const BarCodeInsertModal = (props: BarCodeInsertModalProps) => {
  const { visible, setVisible } = useModalContext()

  const [barCode, setBarCode] = createSignal<string>('')
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
          // TODO: Apply Show when visible for all modals?
        */}
        <BarCodeReader
          enabled={visible()}
          id={`barcode-reader-${currentId++}`}
          onScanned={setBarCode}
        />
        <BarCodeSearch
          barCode={barCode}
          setBarCode={setBarCode}
          food={food}
          setFood={setFood}
        />
      </Modal.Content>
      <Modal.Footer>
        <button
          class="btn"
          onClick={(e) => {
            e.preventDefault()
            setVisible(false)
          }}
        >
          Cancelar
        </button>
        <button
          class="btn-primary btn"
          disabled={food() === null}
          onClick={handleSelect}
        >
          Aplicar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default BarCodeInsertModal
