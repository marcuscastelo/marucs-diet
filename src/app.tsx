import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { Providers } from '~/sections/common/context/Providers'

/**
 * App root layout for all routes. Wraps children with global providers and Suspense.
 * @param props - Children to render inside providers
 * @returns App layout
 */
export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>
            <Providers>{props.children}</Providers>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
