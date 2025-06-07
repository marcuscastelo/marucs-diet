import { ConfirmModalProvider } from '~/sections/common/context/ConfirmModalContext'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import { DarkToaster } from '~/sections/common/components/DarkToaster'
import { GlobalModalContainer } from '~/modules/toast/ui/GlobalModalContainer'
import { type JSXElement } from 'solid-js'

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
