import { BackIcon } from '@/sections/common/components/BackIcon'
import ConfirmModal from '@/sections/common/components/ConfirmModal'
import Modal, { ModalHeader } from '@/sections/common/components/Modal'
import { ConfirmModalProvider, useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { createEffect, createSignal } from 'solid-js'

function App () {
  return (
    <>
      <ConfirmModalProvider>
        <ConfirmModal />
        <h1 class='text-lg'>Oi</h1>
        <button class="btn">Hello daisyUI</button>
        <BackIcon />
        <TestModal />
        <TestConfirmModal />
      </ConfirmModalProvider>
    </>
  )
}

function TestModal () {
  const [visible, setVisible] = createSignal(false)

  createEffect(() => {
    console.debug(`[TestModal] Visible: ${visible()}`)
  })

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <Modal
        header={
          <ModalHeader title="adf"/>
        }
        body={
          <h1>asdfasdf</h1>
        }
      />
      <button onClick={() => setVisible(!visible())}>
        Open modal!
      </button>
    </ModalContextProvider>
  )
}

function TestConfirmModal () {
  const { show } = useConfirmModalContext()
  return (<button onClick={ () => {
    show({
      title: 'Teste123',
      body: 'Teste123',
      actions: [
        {
          text: 'Teste123',
          primary: true,
          onClick: () => { alert('Teste123') }
        }
      ]
    })
  } } > Open confirm modal </button>)
}

export default App
