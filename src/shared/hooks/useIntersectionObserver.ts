import { createSignal, onCleanup, onMount } from 'solid-js'

/**
 * Hook for observing element visibility using Intersection Observer API.
 * @param options - Intersection observer options
 * @param callback - Optional callback function that receives the intersection entry
 * @returns Signal for visibility state, intersection ratio, and ref setter function
 */
export function useIntersectionObserver(
  options: {
    threshold?: number | number[]
    root?: Element | null
  } = {},
  callback?: (entry: IntersectionObserverEntry) => void,
) {
  const [isVisible, setIsVisible] = createSignal(false)
  const [intersectionRatio, setIntersectionRatio] = createSignal(0)

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
          setIntersectionRatio(entry.intersectionRatio)

          if (callback) {
            callback(entry)
          }
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
    if (elementRef) {
      console.debug('useIntersectionObserver: Unobserving element', elementRef)
      observer.unobserve(elementRef)
    }

    elementRef = element

    if (elementRef) {
      console.debug('useIntersectionObserver: Observing element', elementRef)
      observer.observe(elementRef)
    }
  }

  return {
    isVisible,
    intersectionRatio,
    setRef,
  }
}
