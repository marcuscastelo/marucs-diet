import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import '~/assets/styles/globals.css'
import { Providers } from './sections/common/context/Providers'

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
