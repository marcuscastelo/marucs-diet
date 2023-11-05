import Counter from '~/components/Counter'
import './index.css'
import { type JSXElement } from 'solid-js'
import {
  ConfirmModalProvider,
  useConfirmModalContext,
} from '~/sections/common/context/ConfirmModalContext'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'

export default function Home() {
  return (
    <main>
      <Providers>
        <Inner />
      </Providers>
    </main>
  )
}

function Inner() {
  const { show } = useConfirmModalContext()
  return (
    <>
      <h1>Hello world!</h1>
      <Counter />
      <p>
        Visit{' '}
        <a href="https://solidjs.com" target="_blank">
          solidjs.com
        </a>{' '}
        to learn how to build Solid apps.
      </p>
      <button
        onClick={() => {
          show({
            title: 'Teste123',
            body: '123123',
            actions: [],
          })
        }}
      >
        {' '}
        asdfasd
      </button>
    </>
  )
}

function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
