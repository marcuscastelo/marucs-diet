import { type JSXElement } from 'solid-js'
import { ConfirmModalProvider } from './ConfirmModalContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { Toaster } from 'solid-toast'

export function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <Toaster
        toastOptions={{
          className: 'border-2 border-gray-600 p-1',
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            'font-size': '1.2rem',
          },
        }}
        position="top-center"
      />
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
