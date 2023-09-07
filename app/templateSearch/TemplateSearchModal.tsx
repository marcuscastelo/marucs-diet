'use client'

import Modal from '../(modals)/Modal'
import { TemplateSearch, TemplateSearchProps } from './TemplateSearch'
import { useModalContext } from '../(modals)/ModalContext'

export function TemplateSearchModal({ ...props }: TemplateSearchProps) {
  const { visible } = useModalContext()
  console.debug(`[TemplateSearchModal] Render`)
  return (
    <Modal
      modalId="template-search-modal"
      header={<Modal.Header title="Busca de alimentos" />}
      body={
        <div className="max-h-full">
          {visible && <TemplateSearch {...props} />}
        </div>
      }
    />
  )
}
