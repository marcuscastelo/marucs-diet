import { type JSXElement, Suspense } from 'solid-js'

import { lazyImport } from '~/shared/solid/lazyImport'

const { GlobalModalContainer } = lazyImport(
  () => import('~/modules/toast/ui/GlobalModalContainer'),
  ['GlobalModalContainer'],
)
const { UnifiedModalContainer } = lazyImport(
  () => import('~/shared/modal/components/UnifiedModalContainer'),
  ['UnifiedModalContainer'],
)
const { UnifiedModalProvider } = lazyImport(
  () => import('~/shared/modal/context/UnifiedModalProvider'),
  ['UnifiedModalProvider'],
)
const { DarkToaster } = lazyImport(
  () => import('~/sections/common/components/DarkToaster'),
  ['DarkToaster'],
)

export function Providers(props: { children: JSXElement }) {
  return (
    <UnifiedModalProvider>
      <Suspense fallback={<></>}>
        <DarkToaster />
        <GlobalModalContainer />
        <UnifiedModalContainer />
      </Suspense>
      {props.children}
    </UnifiedModalProvider>
  )
}
