'use client'

import Modal, { ModalActions } from '../(modals)/Modal'
import { TemplateSearch, TemplateSearchProps } from './TemplateSearch'
import { useModalContext } from '../(modals)/ModalContext'

export function TemplateSearchModal({ ...props }: TemplateSearchProps) {
  const { visible, onSetVisible } = useModalContext()
  return (
    <Modal
      modalId="template-search-modal"
      header={<h1>Busca de alimentos</h1>}
      body={
        <div className="max-h-full">
          {visible && <TemplateSearch {...props} />}
        </div>
      }
      actions={
        <ModalActions>
          <button onClick={() => onSetVisible(false)}>Fechar</button>
        </ModalActions>
      }
    />
  )
}
