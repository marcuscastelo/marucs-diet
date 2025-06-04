import { createEffect, createSignal } from 'solid-js'
import { type z } from 'zod'

// Utility to check if an error is a NotAllowedError DOMException
function isClipboardNotAllowedError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError'
}

export type ClipboardFilter = (clipboard: string) => boolean

export function useClipboard(props?: {
  filter?: ClipboardFilter
  periodicRead?: boolean
}) {
  const filter = () => props?.filter
  const periodicRead = () => props?.periodicRead ?? true
  const [clipboard, setClipboard] = createSignal('')

  const handleWrite = (text: string, onError?: (error: unknown) => void) => {
    window.navigator.clipboard
      .writeText(text)
      .then(() => setClipboard(text))
      .catch((err) => {
        if (isClipboardNotAllowedError(err)) {
          // Ignore NotAllowedError (likely DOM not focused)
          return
        }
        if (onError !== undefined && onError !== null) onError(err)
      })
  }

  const handleRead = () => {
    const afterRead = (newClipboard: string) => {
      const filter_ = filter()
      if (filter_ !== undefined && !filter_(newClipboard)) {
        setClipboard('')
        return
      }

      setClipboard(newClipboard)
    }
    window.navigator.clipboard
      .readText()
      .then(afterRead)
      .catch(() => {
        // Do nothing. This is expected when the DOM is not focused
      })
  }
  // Update clipboard periodically
  createEffect(() => {
    if (!periodicRead()) return

    const interval = setInterval(handleRead, 1000)
    return () => {
      clearInterval(interval)
    }
  })

  return {
    clipboard,
    write: handleWrite,
    read: handleRead,
    clear: () => {
      handleWrite('')
    },
  }
}

export function createClipboardSchemaFilter(
  acceptedClipboardSchema: z.ZodType,
) {
  return (clipboard: string) => {
    if (clipboard === '') return false
    let parsedClipboard: unknown
    try {
      parsedClipboard = JSON.parse(clipboard)
    } catch {
      // Error parsing JSON. Probably clipboard is some random text from the user
      return false
    }

    return acceptedClipboardSchema.safeParse(parsedClipboard).success
  }
}
