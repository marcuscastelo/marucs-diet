import { createEffect, createSignal } from 'solid-js'
import { type z } from 'zod'

export type ClipboardFilter = (clipboard: string) => boolean

export function useClipboard(props?: {
  filter?: ClipboardFilter
  periodicRead?: boolean
}) {
  const filter = () => props?.filter
  const periodicRead = () => props?.periodicRead ?? true
  const [clipboard, setClipboard] = createSignal('')

  const handleWrite = (text: string) => {
    window.navigator.clipboard
      .writeText(text)
      .then(() => setClipboard(text))
      .catch(() => {
        // Do nothing. This is expected when the DOM is not focused
      })
  }

  const handleRead = () => {
    window.navigator.clipboard
      .readText()
      .then((newClipboard) => {
        const filter_ = filter()
        if (filter_ !== undefined && !filter_(newClipboard)) {
          setClipboard('')
          return
        }

        setClipboard(newClipboard)
      })
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
    } catch (e) {
      // Error parsing JSON. Probably clipboard is some random text from the user
      return false
    }

    return acceptedClipboardSchema.safeParse(parsedClipboard).success
  }
}
