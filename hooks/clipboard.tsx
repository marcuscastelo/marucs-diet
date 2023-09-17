'use client'

import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'

export type ClipboardFilter = (clipboard: string) => boolean

export default function useClipboard(props?: {
  filter?: ClipboardFilter
  periodicRead?: boolean
}) {
  const filter = props?.filter
  const periodicRead = props?.periodicRead ?? true
  const [clipboard, setClipboard] = useState('')

  const handleWrite = useCallback((text: string) => {
    window.navigator.clipboard.writeText(text).then(() => setClipboard(text))
  }, [])

  const handleRead = useCallback(() => {
    window.navigator.clipboard
      .readText()
      .then((newClipboard) => {
        if (filter && !filter(newClipboard)) {
          setClipboard('')
          return
        }

        setClipboard(newClipboard)
      })
      .catch(() => {
        // Do nothing. This is expected when the DOM is not focused
      })
  }, [filter])

  // Update clipboard periodically
  useEffect(() => {
    if (!periodicRead) return

    const interval = setInterval(handleRead, 1000)
    return () => clearInterval(interval)
  }, [periodicRead, filter, handleRead])

  return {
    clipboard,
    write: handleWrite,
    read: handleRead,
    clear: () => handleWrite(''),
  }
}

export function createClipboardSchemaFilter(
  acceptedClipboardSchema: z.ZodType,
) {
  return (clipboard: string) => {
    if (!clipboard) return false
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
