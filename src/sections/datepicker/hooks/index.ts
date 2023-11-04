import { createEffect } from 'solid-js'

export default function useOnClickOutside (
  ref: HTMLDivElement | undefined,
  handler: (e?: MouseEvent | TouchEvent) => void
) {
  createEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref || ref.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  })
}
