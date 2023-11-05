import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { createEffect, createSignal, onCleanup } from 'solid-js'

export type PageLoadingProps = {
  message: string
}

export function PageLoading(props: PageLoadingProps) {
  const [label, setLabel] = createSignal(props.message)
  const [tooSlow, setTooSlow] = createSignal(false)

  createEffect(() => {
    const interval = setInterval(() => {
      const dots = label().match(/\./g)?.length ?? 0
      if (dots < 3) {
        setLabel(label() + '.')
      } else {
        setLabel(props.message)
      }
    }, 300)
    onCleanup(() => {
      clearInterval(interval)
    })
  })

  createEffect(() => {
    const timeout = setTimeout(() => {
      setTooSlow(true)
    }, 5000)
    onCleanup(() => {
      clearTimeout(timeout)
    })
  })

  return (
    <div class={'flex h-full min-h-screen w-full justify-center'}>
      <div class="flex w-full flex-col justify-center align-middle">
        <LoadingRing />
        <span class="inline-block w-full text-center">{label()}</span>
        {tooSlow() && (
          <span class="inline-block w-full text-center text-red-500">
            O servidor está demorando para responder. Tente novamente mais
            tarde.
          </span>
        )}
      </div>
    </div>
  )
}
