'use client'

import { Ref, forwardRef, useState } from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/Modal'
import FoodSearch, { FoodSearchProps } from './FoodSearch'
import { ModalContextProvider } from '../(modals)/ModalContext'

// eslint-disable-next-line react/display-name
const FoodSearchModal = forwardRef(
  (
    {
      onVisibilityChange,
      ...props
    }: FoodSearchProps & {
      onVisibilityChange?: (isShowing: boolean) => void
    },
    ref: Ref<ModalRef>,
  ) => {
    const [visible, setVisible] = useState(false)

    const handleVisibilityChange = (isShowing: boolean) => {
      setVisible(isShowing)
      onVisibilityChange?.(isShowing)
    }

    return (
      <ModalContextProvider
        visible={false}
        onVisibilityChange={handleVisibilityChange}
      >
        <Modal
          ref={ref}
          modalId="foodSearchModal"
          header={<h1>Busca de alimentos</h1>}
          body={
            <div className="max-h-full">
              {visible && <FoodSearch {...props} />}
            </div>
          }
          actions={
            <ModalActions>
              <button onClick={() => ref?.current?.close()}>Fechar</button>
            </ModalActions>
          }
        />
      </ModalContextProvider>
    )
  },
)

export default FoodSearchModal
