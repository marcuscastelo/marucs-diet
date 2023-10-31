import { BackIcon } from '@/sections/common/components/BackIcon'
import ConfirmModal from '@/sections/common/components/ConfirmModal'
import { FloatInput } from '@/sections/common/components/FloatInput'
import LoadingRing from '@/sections/common/components/LoadingRing'
import Modal, { ModalHeader } from '@/sections/common/components/Modal'
import PageLoading from '@/sections/common/components/PageLoading'
import { ConfirmModalProvider, useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { useFloatField } from '@/sections/common/hooks/useField'
import { createEffect, createSignal } from 'solid-js'

function App () {
  return (
    <>
      <ConfirmModalProvider>
        <ConfirmModal />
        <h1 class='text-lg'>Oi</h1>
        <button class="btn">Hello daisyUI</button>
        <BackIcon />
        <TestField />
        <TestModal />
        <TestConfirmModal />
        <LoadingRing />
        <PageLoading message='Carregando bugigangas'/>
      </ConfirmModalProvider>
    </>
  )
}

function TestField () {
  const testField = useFloatField(() => 0, {
    decimalPlaces: 2
  })

  return (
    <FloatInput field={testField}/>
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
