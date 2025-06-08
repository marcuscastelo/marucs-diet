import { type JSXElement } from 'solid-js'

import { GlobalModalContainer } from '~/modules/toast/ui/GlobalModalContainer'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import { DarkToaster } from '~/sections/common/components/DarkToaster'
import { ConfirmModalProvider } from '~/sections/common/context/ConfirmModalContext'

export function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      <DarkToaster />
      <GlobalModalContainer />
      {props.children}
    </ConfirmModalProvider>
  )
}
