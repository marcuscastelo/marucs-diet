import '~/app.css'

import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { createMemo, createSignal, onCleanup, Show, Suspense } from 'solid-js'

import { currentUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import { BackendOutageBanner } from '~/sections/common/components/BackendOutageBanner'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { Providers } from '~/sections/common/context/Providers'

function useAspectWidth() {
  const [width, setWidth] = createSignal(getWidth())
  function getWidth() {
    return Math.min((window.innerHeight * 14) / 16, window.innerWidth)
  }
  function onResize() {
    setWidth(getWidth())
  }
  window.addEventListener('resize', onResize)
  onCleanup(() => window.removeEventListener('resize', onResize))
  return width
}

/**
 * App root layout for all routes. Wraps children with global providers and Suspense.
 * @param props - Children to render inside providers
 * @returns App layout
 */
export default function App() {
  const width = useAspectWidth()
  // Debug dump state
  const debugDump = createMemo(() => {
    return {
      user: currentUser(),
      weights: userWeights(),
      now: new Date().toISOString(),
    }
  })
  function handleDumpClick() {
    const dump = debugDump()
    const dumpStr = JSON.stringify(dump, null, 2)
    void navigator.clipboard.writeText(dumpStr)
    alert('Dump copied to clipboard!')
  }
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>
            <Providers>
              <BackendOutageBanner />
              <Show when={currentUser()?.id === 3}>
                <button
                  style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    'z-index': 9999,
                  }}
                  class="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-800 text-xs"
                  onClick={handleDumpClick}
                >
                  Dump de Dados (debug)
                </button>
              </Show>
              <div
                class="mx-auto flex flex-col justify-between bg-black h-screen w-screen rounded-none"
                style={{ width: `${width()}px` }}
              >
                <div class="mx-auto w-full flex flex-col justify-between p-1 px-1 -mt-5 sm:mt-0 sm:px-5">
                  {props.children}
                </div>
                <BottomNavigation />
              </div>
            </Providers>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
