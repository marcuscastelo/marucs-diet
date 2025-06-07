import { type ParentProps, Suspense } from 'solid-js'
import '~/assets/styles/globals.css'
import { Providers } from '~/sections/common/context/Providers'

/**
 * App root layout for all routes. Wraps children with global providers and Suspense.
 * @param props - Children to render inside providers
 * @returns App layout
 */
export default function App(props: ParentProps) {
  return (
    <Suspense>
      <Providers>{props.children}</Providers>
    </Suspense>
  )
}
