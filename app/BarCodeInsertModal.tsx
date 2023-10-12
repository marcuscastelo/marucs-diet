'use client'

import { Food } from '@/model/foodModel'
import { useState } from 'react'
import Modal, { ModalActions } from './(modals)/Modal'
import { BarCodeReader } from './BarCodeReader'
import BarCodeSearch from './BarCodeSearch'
import { useModalContext } from './(modals)/ModalContext'

export type BarCodeInsertModalProps = {
  onSelect: (apiFood: Food) => void
}

const BarCodeInsertModal = ({ onSelect }: BarCodeInsertModalProps) => {
  const { visibleNew } = useModalContext()

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
      header={<Modal.Header title="Pesquisar por código de barras" />}
      body={
        <>
          {visibleNew.value && (
            <BarCodeReader id="reader" onScanned={setBarCode} />
          )}
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
              visibleNew.value = false
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
