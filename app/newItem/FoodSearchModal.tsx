'use client'

import Modal, { ModalActions } from '../(modals)/Modal'
import FoodSearch, { FoodSearchProps } from './FoodSearch'
import { useModalContext } from '../(modals)/ModalContext'

// eslint-disable-next-line react/display-name
const FoodSearchModal = ({ ...props }: FoodSearchProps) => {
  const { visible, setVisible } = useModalContext()
  return (
    <Modal
      modalId="foodSearchModal"
      header={<h1>Busca de alimentos</h1>}
      body={
        <div className="max-h-full">{visible && <FoodSearch {...props} />}</div>
      }
      actions={
        <ModalActions>
          <button onClick={() => setVisible(false)}>Fechar</button>
        </ModalActions>
      }
    />
  )
}

export default FoodSearchModal
