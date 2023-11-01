import { createSignal } from 'solid-js'

export function useTyping ({
  onTypingStart,
  onTypingEnd,
  delay = 500
}: {
  onTypingStart?: () => void
  onTypingEnd?: () => void
  delay?: number
}) {
  const [typing, setTyping] = createSignal(false)
  const [timeoutId, setTimeoutId] = createSignal<NodeJS.Timeout | null>(null)

  const handleTypingStart = () => {
    setTyping(true)
    onTypingStart?.()
  }

  const handleTypingEnd = () => {
    setTyping(true)
    onTypingEnd?.()
  }

  const handleTyping = () => {
    const timeoutId_ = timeoutId()
    if (timeoutId_ !== null) clearTimeout(timeoutId_)
    handleTypingStart()
    setTimeoutId(setTimeout(() => {
      handleTypingEnd()
    }, delay))
  }

  return {
    typing,
    onTyped: handleTyping
  }
}
