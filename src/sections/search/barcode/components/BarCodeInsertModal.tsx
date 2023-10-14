'use client'

import { Food } from '@/model/foodModel'
import Modal, { ModalActions } from '@/app/(modals)/Modal'
import { BarCodeReader } from '@/sections/search/barcode/components/BarCodeReader'
import BarCodeSearch from '@/sections/search/barcode/components/BarCodeSearch'
import { useModalContext } from '@/app/(modals)/ModalContext'
import { useSignal } from '@preact/signals-react'

export type BarCodeInsertModalProps = {
  onSelect: (apiFood: Food) => void
}

const BarCodeInsertModal = ({ onSelect }: BarCodeInsertModalProps) => {
  const { visible } = useModalContext()

  const barCode = useSignal<string>('')
  const food = useSignal<Food | null>(null)

  const handleSelect = async (e?: React.SyntheticEvent) => {
    e?.preventDefault()

    if (!food.value) {
      console.warn('Ignoring submit because food is null')
      return
    }

    onSelect(food.value)
  }

  return (
    <Modal
      header={<Modal.Header title="Pesquisar por código de barras" />}
      body={
        <>
          {visible.value && (
            <BarCodeReader
              id="reader"
              onScanned={(barCodeValue) => (barCode.value = barCodeValue)}
            />
          )}
          <BarCodeSearch barCode={barCode} food={food} />
        </>
      }
      actions={
        <ModalActions>
          <button
            className="btn"
            onClick={(e) => {
              e.preventDefault()
              visible.value = false
            }}
          >
            Cancelar
          </button>
          <button
            className="btn-primary btn"
            disabled={!food.value}
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
