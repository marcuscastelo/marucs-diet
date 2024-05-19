import { ConfirmModalProvider } from './ConfirmModalContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { DarkToaster } from '../components/DarkToaster'
import { type JSXElement } from 'solid-js'

export function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      <DarkToaster />
      {props.children}
    </ConfirmModalProvider>
  )
}
