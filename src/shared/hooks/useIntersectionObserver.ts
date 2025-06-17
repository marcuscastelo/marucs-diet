import { createSignal, onCleanup, onMount } from 'solid-js'

/**
 * Hook for observing element visibility using Intersection Observer API.
 * @param options - Intersection observer options
 * @returns Signal for visibility state and ref setter function
 */
export function useIntersectionObserver(
  options: {
    threshold?: number | number[]
    root?: Element | null
  } = {},
) {
  const [isVisible, setIsVisible] = createSignal(false)

  let elementRef: Element | undefined
  let observer: IntersectionObserver | undefined

  const { threshold = 0.1, root = null } = options

  onMount(() => {
    console.debug('useIntersectionObserver: Mounting observer with options:', {
      threshold,
      root,
    })
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          const visible = entry.intersectionRatio > 0
          setIsVisible(visible)
        }
      },
      {
        threshold,
        root,
      },
    )
  })

  onCleanup(() => {
    observer?.disconnect()
  })

  const setRef = (element: Element | undefined) => {
    if (!observer) {
      setTimeout(() => {
        console.debug(
          'useIntersectionObserver: Observer not initialized, retrying...',
        )
        setRef(element)
      }, 100)
      return
    }

    console.debug('useIntersectionObserver: Setting ref', element)
    if (elementRef && observer) {
      console.debug('useIntersectionObserver: Unobserving element', elementRef)
      observer.unobserve(elementRef)
    }

    elementRef = element

    if (elementRef && observer) {
      console.debug('useIntersectionObserver: Observing element', elementRef)
      observer.observe(elementRef)
    }
  }

  return {
    isVisible,
    setRef,
  }
}
