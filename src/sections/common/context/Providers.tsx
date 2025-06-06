import { ConfirmModalProvider } from './ConfirmModalContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { DarkToaster } from '../components/DarkToaster'
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
