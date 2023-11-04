import { type Accessor, createEffect } from 'solid-js'

export default function useOnClickOutside (
  ref: Accessor<HTMLDivElement | undefined>,
  handler: (e?: MouseEvent | TouchEvent) => void
) {
  createEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (ref()?.contains(event.target as Node)) {
        console.error('ref is not defined or event target is not a Node')
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
