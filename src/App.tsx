import { BottomNavigation } from '@/sections/common/components/BottomNavigation'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'

function App () {
  return (
    <>
      <ConfirmModalProvider>
        <h1 class='text-lg'>Oi</h1>
        <BottomNavigation />
      </ConfirmModalProvider>
    </>
  )
}

export default App
