import { type JSXElement } from 'solid-js'

import { lazyImport } from '~/shared/solid/lazyImport'

const { GlobalModalContainer } = lazyImport(
  () => import('~/modules/toast/ui/GlobalModalContainer'),
  ['GlobalModalContainer'],
)
const { UnifiedModalContainer } = lazyImport(
  () => import('~/shared/modal/components/UnifiedModalContainer'),
  ['UnifiedModalContainer'],
)

const { DarkToaster } = lazyImport(
  () => import('~/sections/common/components/DarkToaster'),
  ['DarkToaster'],
)

export function Providers(props: { children: JSXElement }) {
  return (
    <>
      <DarkToaster />
      <GlobalModalContainer />
      <UnifiedModalContainer />
      {props.children}
    </>
  )
}
