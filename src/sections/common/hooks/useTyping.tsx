import { ReadonlySignal, useSignal } from '@preact/signals-react'
import { useCallback } from 'react'

export function useTyping({
  onTypingStart,
  onTypingEnd,
  delay = 500,
}: {
  onTypingStart?: () => void
  onTypingEnd?: () => void
  delay?: number
}) {
  const typing = useSignal(false)
  const timeoutId = useSignal<NodeJS.Timeout | null>(null)

  const handleTypingStart = useCallback(() => {
    typing.value = true
    onTypingStart?.()
  }, [onTypingStart, typing])

  const handleTypingEnd = useCallback(() => {
    typing.value = false
    onTypingEnd?.()
  }, [onTypingEnd, typing])

  const handleTyping = useCallback(() => {
    if (timeoutId.value) clearTimeout(timeoutId.value)
    handleTypingStart()
    timeoutId.value = setTimeout(() => {
      handleTypingEnd()
    }, delay)
  }, [timeoutId, delay, handleTypingEnd, handleTypingStart])

  return {
    typing: typing as ReadonlySignal<boolean>,
    onTyped: handleTyping,
  }
}
