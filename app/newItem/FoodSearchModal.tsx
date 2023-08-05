'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import FoodSearch, { FoodSearchProps } from './FoodSearch'

// eslint-disable-next-line react/display-name
const FoodSearchModal = forwardRef(
  (
    {
      onVisibilityChange,
      ...props
    }: FoodSearchProps & {
      onVisibilityChange?: (isShowing: boolean) => void
    },
    ref,
  ) => {
    const [, setShowing_] = useState(false)

    const modalRef = useRef<ModalRef>(null)

    const handleSetShowing = (isShowing: boolean) => {
      setShowing_(isShowing)
      onVisibilityChange?.(isShowing)
    }

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
        ref={modalRef}
        modalId="foodSearchModal"
        header={<h1>Busca de alimentos</h1>}
        body={
          <div className="max-h-full">
            <FoodSearch {...props} />
          </div>
        }
        actions={
          <ModalActions>
            <button onClick={() => modalRef.current?.close()}>Fechar</button>
          </ModalActions>
        }
      />
    )
  },
)

export default FoodSearchModal
