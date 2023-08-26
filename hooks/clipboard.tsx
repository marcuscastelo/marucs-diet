'use client'

import { useCallback, useEffect, useState } from 'react'

export type ClipboardFilter = (clipboard: string) => boolean

export default function useClipboard(props?: { filter?: ClipboardFilter }) {
  const filter = props?.filter
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
    const interval = setInterval(handleRead, 1000)

    return () => clearInterval(interval)
  }, [filter, handleRead])

  return {
    clipboard,
    write: handleWrite,
    read: handleRead,
  }
}
