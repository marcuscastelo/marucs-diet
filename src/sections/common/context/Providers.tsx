import { type JSXElement, Suspense } from 'solid-js'

import { lazyImport } from '~/shared/solid/lazyImport'

const { GlobalModalContainer } = lazyImport(
  () => import('~/modules/toast/ui/GlobalModalContainer'),
  ['GlobalModalContainer'],
)
const { ConfirmModal } = lazyImport(
  () => import('~/sections/common/components/ConfirmModal'),
  ['ConfirmModal'],
)
const { DarkToaster } = lazyImport(
  () => import('~/sections/common/components/DarkToaster'),
  ['DarkToaster'],
)
const { ConfirmModalProvider } = lazyImport(
  () => import('~/sections/common/context/ConfirmModalContext'),
  ['ConfirmModalProvider'],
)

export function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <Suspense fallback={<></>}>
        <ConfirmModal />
        <DarkToaster />
        <GlobalModalContainer />
      </Suspense>
      {props.children}
    </ConfirmModalProvider>
  )
}
