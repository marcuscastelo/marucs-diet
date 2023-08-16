'use client'

import { Food } from '@/model/foodModel'
import { useState } from 'react'
import Modal, { ModalActions } from './(modals)/Modal'
import { BarCodeReader } from './BarCodeReader'
import BarCodeSearch from './BarCodeSearch'
import Show from './Show'
import { useModalContext } from './(modals)/ModalContext'

export type BarCodeInsertModalProps = {
  modalId: string
  onSelect: (apiFood: Food) => void
}

// eslint-disable-next-line react/display-name
const BarCodeInsertModal = ({ modalId, onSelect }: BarCodeInsertModalProps) => {
  const { visible, setVisible } = useModalContext()

  const [barCode, setBarCode] = useState<string>('')
  const [food, setFood] = useState<Food | null>(null)

  const handleSelect = async (e?: React.SyntheticEvent) => {
    e?.preventDefault()

    if (!food) {
      console.warn('Ignoring submit because food is null')
      return
    }

    onSelect(food)
  }

  return (
    <Modal
      modalId={modalId}
      header={<h1 className="modal-title">Pesquisar por código de barras</h1>}
      body={
        <>
          <Show when={visible}>
            <BarCodeReader id="reader" onScanned={setBarCode} />
          </Show>
          <BarCodeSearch
            barCode={barCode}
            setBarCode={setBarCode}
            onFoodChange={setFood}
          />
        </>
      }
      actions={
        <ModalActions>
          <button
            className="btn"
            onClick={(e) => {
              e.preventDefault()
              setVisible(false)
            }}
          >
            Cancelar
          </button>
          <button
            className="btn-primary btn"
            disabled={!food}
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
