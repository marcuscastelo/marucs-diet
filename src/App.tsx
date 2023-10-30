import { BackIcon } from '@/sections/common/components/BackIcon'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'

function App () {
  return (
    <>
      <ConfirmModalProvider>
        <h1 class='text-lg'>Oi</h1>
        <BackIcon />
      </ConfirmModalProvider>
    </>
  )
}

export default App
