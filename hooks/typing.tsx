import { useCallback, useEffect, useState } from 'react'

export function useTyping({
  onTypingStart,
  onTypingEnd,
  delay = 500,
}: {
  onTypingStart?: () => void
  onTypingEnd?: () => void
  delay?: number
}) {
  const [typing, setTyping] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleTypingStart = useCallback(() => {
    setTyping(true)
    onTypingStart?.()
  }, [onTypingStart])

  const handleTypingEnd = useCallback(() => {
    setTyping(false)
    onTypingEnd?.()
  }, [onTypingEnd])

  const handleTyping = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId)
    handleTypingStart()
    setTimeoutId(
      setTimeout(() => {
        handleTypingEnd()
      }, delay),
    )
  }, [timeoutId, delay, handleTypingEnd, handleTypingStart])

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  return {
    typing,
    onTyped: handleTyping,
  }
}
