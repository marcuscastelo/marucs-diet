import '~/app.css'

import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { createSignal, onCleanup, Suspense } from 'solid-js'

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
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>
            <Providers>
              <div
                class="mx-auto flex flex-col justify-between bg-black h-screen w-screen rounded-none"
                style={{ width: `${width()}px` }}
              >
                <div class="mx-auto w-full flex flex-col justify-between p-1 px-1 -mt-5 sm:mt-0 sm:px-5 xs">
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
