import { type JSXElement } from 'solid-js'

import { lazyImport } from '~/shared/solid/lazyImport'

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
      <UnifiedModalContainer />
      {props.children}
    </>
  )
}
