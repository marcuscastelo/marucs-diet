'use client'

import { Food } from '@/model/foodModel'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalActions, ModalRef } from './(modals)/modal'
import { BarCodeReader } from './BarCodeReader'
import BarCodeSearch from './BarCodeSearch'
import Show from './Show'

export type BarCodeInsertModalProps = {
  modalId: string
  onSelect: (apiFood: Food) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

// eslint-disable-next-line react/display-name
const BarCodeInsertModal = forwardRef(
  (
    { modalId, onSelect, onVisibilityChange }: BarCodeInsertModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [barCode, setBarCode] = useState<string>('')
    const [food, setFood] = useState<Food | null>(null)
    const [showing, setShowing] = useState(false)

    const modalRef = useRef<ModalRef>(null)

    const handleSetShowing = (isShowing: boolean) => {
      setShowing(isShowing)
      onVisibilityChange?.(isShowing)
    }

    const handleSelect = async (e?: React.SyntheticEvent) => {
      e?.preventDefault()

      if (!food) {
        console.warn('Ignoring submit because food is null')
        return
      }

      onSelect(food)
    }

    // TODO: revisar se isso é necessário
    useImperativeHandle(ref, () => ({
      showModal: () => {
        modalRef.current?.showModal()
        handleSetShowing(true)
      },
      close: () => {
        modalRef.current?.close()
        handleSetShowing(false)
      },
    }))

    return (
      <Modal
        modalId={modalId}
        ref={modalRef}
        onSubmit={handleSelect}
        header={<h1 className="modal-title">Pesquisar por código de barras</h1>}
        onVisibilityChange={handleSetShowing}
        body={
          <>
            <Show when={showing}>
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
                modalRef.current?.close()
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
  },
)

export default BarCodeInsertModal
