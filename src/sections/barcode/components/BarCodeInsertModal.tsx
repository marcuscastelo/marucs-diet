import { type Food } from '@/modules/diet/food/domain/food'
import { Modal, ModalActions, ModalHeader } from '@/sections/common/components/Modal'
import { BarCodeReader } from '@/sections/barcode/components/BarCodeReader'
import BarCodeSearch from '@/sections/barcode/components/BarCodeSearch'
import { useModalContext } from '@/sections/common/context/ModalContext'
import { Show, createSignal, onMount } from 'solid-js'

export type BarCodeInsertModalProps = {
  onSelect: (apiFood: Food) => void
}

let currentId = 1

const BarCodeInsertModal = (props: BarCodeInsertModalProps) => {
  const { visible, setVisible } = useModalContext()

  const [barCode, setBarCode] = createSignal<string>('')
  const [food, setFood] = createSignal<Food | null>(null)

  const handleSelect = (e?: MouseEvent & {
    currentTarget: HTMLButtonElement
    target: Element
  }) => {
    e?.preventDefault()

    const food_ = food()
    if (food_ === null) {
      console.warn('Ignoring submit because food is null')
      return
    }

    props.onSelect(food_)
  }

  onMount(() => {
    setVisible(false)
  })

  return (
    <Modal
      header={<ModalHeader title="Pesquisar por código de barras" />}
      body={
        <>
          {/*
            // TODO: Apply Show when visible for all modals?
          */}
          <BarCodeReader
            enabled={visible()}
            id={`barcode-reader-${currentId++}`}
            onScanned={setBarCode}
          />
          <BarCodeSearch barCode={barCode} setBarCode={setBarCode} food={food} setFood={setFood} />
        </>
      }
      actions={
        <ModalActions>
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
        </ModalActions>
      }
    />
  )
}

export default BarCodeInsertModal
