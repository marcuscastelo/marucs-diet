import { type Food } from '@/modules/diet/food/domain/food'
import { Modal, ModalActions, ModalHeader } from '@/sections/common/components/Modal'
import { BarCodeReader } from '@/sections/barcode/components/BarCodeReader'
import BarCodeSearch from '@/sections/barcode/components/BarCodeSearch'
import { useModalContext } from '@/sections/common/context/ModalContext'
import { Show, createSignal } from 'solid-js'

export interface BarCodeInsertModalProps {
  onSelect: (apiFood: Food) => void
}

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

  return (
    <Modal
      header={<ModalHeader title="Pesquisar por código de barras" />}
      body={
        <>
          {/*
            // TODO: Apply Show when visible for all modals?
          */}
          <Show when={visible} >
            <BarCodeReader
              id="reader"
              onScanned={setBarCode}
            />
          </Show>
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
