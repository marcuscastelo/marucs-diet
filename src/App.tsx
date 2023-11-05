import { TestApp } from '@/TestApp'
import DietPage from '@/app/DietPage'
import { ProfilePage } from '@/app/ProfilePage'
import { ConfirmModal } from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'
import { Route, Routes } from '@solidjs/router'
import { type JSXElement } from 'solid-js'

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" component={DietPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/test" component={TestApp} />
      </Routes>
    </Providers>
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
