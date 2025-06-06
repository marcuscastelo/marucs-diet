/**
 * Toast Queue Manager
 *
 * Manages a queue of toasts to ensure only one toast is visible at a time,
 * with intelligent prioritization and deduplication.
 * Uses a fixed 100ms setInterval for processing instead of dynamic timeouts.
 */

import { createSignal, createEffect, createRoot } from 'solid-js'
import {
  ToastItem,
  ToastQueueConfig,
  DEFAULT_QUEUE_CONFIG,
  TOAST_PRIORITY,
  TOAST_DURATION_INFINITY,
} from '~/modules/toast/domain/toastTypes'
import { displayToast } from '~/modules/toast/ui/displayToast'
import { dismissToast } from '~/modules/toast/ui/dismissToast'

// Global queue state
const [queue, setQueue] = createSignal<ToastItem[]>([])
let config: ToastQueueConfig = { ...DEFAULT_QUEUE_CONFIG }

// Timestamp tracking for interval-based processing
let lastTransitionTime: number = 0
let intervalId: number | null = null

// Derived signals
const currentToast = () => queue()[0] ?? null

// Check if we're in a transition period (waiting between toasts)
const isInTransition = () => {
  const now = Date.now()
  return now - lastTransitionTime < config.transitionDelay
}

// Initialize the queue manager inside a createRoot to avoid disposal warnings
let queueManagerDispose: (() => void) | null = null

function initializeQueueManager() {
  if (queueManagerDispose !== null) return // Already initialized

  queueManagerDispose = createRoot((dispose) => {
    // Start the interval-based processing
    if (intervalId === null) {
      intervalId = window.setInterval(processQueue, 100)
      console.debug('[ToastQueue] Started interval-based processing')
    }

    // Auto-process queue when needed (immediate processing for new toasts)
    createEffect(() => {
      const currentItem = currentToast()
      const inTransition = isInTransition()
      const queueLength = queue().length

      console.debug(
        '[ToastQueue] createEffect triggered - currentToast:',
        currentItem !== null,
        'inTransition:',
        inTransition,
        'queueLength:',
        queueLength,
        'currentItem solidToastId:',
        currentItem?.solidToastId,
      )

      // Process immediately if there's a current toast that hasn't been displayed yet
      if (
        currentItem !== null &&
        !inTransition &&
        currentItem.solidToastId === undefined
      ) {
        console.debug(
          '[ToastQueue] createEffect calling processNext - current toast needs to be displayed',
        )
        processNext()
      }
    })

    return dispose
  })
}

/**
 * Interval-based queue processor
 * Runs every 100ms to check for toasts that need to be processed or dismissed
 */
function processQueue(): void {
  const currentItem = currentToast()
  const now = Date.now()

  // Check if current toast should be auto-dismissed
  if (currentItem !== null && currentItem.solidToastId !== undefined) {
    const duration = currentItem.options.duration
    const displayTime = currentItem.displayedAt

    if (
      duration !== undefined &&
      duration !== null &&
      duration !== TOAST_DURATION_INFINITY &&
      duration > 0 &&
      displayTime !== undefined &&
      now - displayTime >= duration
    ) {
      console.debug(
        '[ToastQueue] Auto-dismissing toast after duration:',
        currentItem.message,
      )
      removeCurrentToast()
      return
    }
  }

  // Check if we can process the next toast
  if (!isInTransition()) {
    const nextToast = queue()[0]
    if (nextToast !== undefined && nextToast.solidToastId === undefined) {
      console.debug(
        '[ToastQueue] Interval processing next toast:',
        nextToast.message,
      )
      processNext()
    }
  }
}

/**
 * Check for duplicate messages to avoid spam
 */
function isDuplicateToast(newToast: ToastItem): boolean {
  // Check current toast
  const current = currentToast()
  if (
    current !== null &&
    current.message === newToast.message &&
    current.options.level === newToast.options.level
  ) {
    return true
  }

  // Check queue
  return queue().some(
    (existingToast) =>
      existingToast.message === newToast.message &&
      existingToast.options.level === newToast.options.level,
  )
}

/**
 * Sort toasts by priority (higher priority first)
 */
function sortByPriority(toasts: ToastItem[]): ToastItem[] {
  return [...toasts].sort((a, b) => b.priority - a.priority)
}

/**
 * Add a toast to the queue and return the toast ID
 */
export function enqueue(toastItem: ToastItem): string {
  // Initialize the queue manager if not already done
  initializeQueueManager()

  if (isDuplicateToast(toastItem)) {
    console.debug('[ToastQueue] Duplicate toast ignored:', toastItem.message)
    return toastItem.id
  }

  // Add new toast and sort by priority
  const currentQueue = queue()
  const newQueue = [...currentQueue, toastItem]
  const sortedQueue = sortByPriority(newQueue)
  setQueue(sortedQueue)

  console.debug(
    '[ToastQueue] Toast enqueued:',
    toastItem.message,
    'ID:',
    toastItem.id,
    'Queue length:',
    sortedQueue.length,
  )

  return toastItem.id
}

/**
 * Remove current toast and mark transition time
 */
function removeCurrentToast(): void {
  const current = currentToast()
  if (current !== null) {
    console.debug('[ToastQueue] Removing current toast:', current.message)

    // Dismiss the actual solid-toast if it exists
    if (current.solidToastId !== undefined) {
      dismissToast(current.solidToastId)
    }

    // Remove the first item from queue (which is the current toast)
    const currentQueue = queue()
    const remainingQueue = currentQueue.slice(1)
    setQueue(remainingQueue)

    // Mark transition time
    lastTransitionTime = Date.now()
  }
}

/**
 * Remove current toast and process next in queue
 */
export function dequeue(): void {
  removeCurrentToast()
}

/**
 * Remove a specific toast by ID from queue or current toast
 */
export function dequeueById(toastId: string): boolean {
  const current = currentToast()

  // Check if the toast to remove is currently displayed (first in queue)
  if (current?.id === toastId) {
    console.debug(
      '[ToastQueue] Dequeuing current toast by ID:',
      toastId,
      current.message,
    )
    removeCurrentToast()
    return true
  }

  // Otherwise, remove from queue
  const currentQueue = queue()
  const toastIndex = currentQueue.findIndex((toast) => toast.id === toastId)

  if (toastIndex >= 0) {
    const removedToast = currentQueue[toastIndex]

    // Dismiss the solid-toast if it exists
    if (removedToast.solidToastId !== undefined) {
      dismissToast(removedToast.solidToastId)
    }

    const newQueue = currentQueue.filter((toast) => toast.id !== toastId)
    setQueue(newQueue)

    console.debug(
      '[ToastQueue] Removed toast from queue by ID:',
      toastId,
      removedToast.message,
    )
    return true
  }

  console.debug('[ToastQueue] Toast not found for dequeue by ID:', toastId)
  return false
}

/**
 * Process next toast in queue
 */
function processNext(): void {
  const currentQueue = queue()
  const nextToast = currentQueue[0]

  if (nextToast === undefined) {
    console.debug('[ToastQueue] processNext early return - queue is empty')
    return
  }

  // Check if this toast is already being displayed
  if (nextToast.solidToastId !== undefined) {
    console.debug(
      '[ToastQueue] processNext early return - toast already displayed:',
      nextToast.message,
    )
    return
  }

  console.debug(
    '[ToastQueue] Processing next toast:',
    nextToast.message,
    'Duration:',
    nextToast.options.duration,
    'ID:',
    nextToast.id,
  )

  // Actually display the toast and store solid-toast ID in the queue item
  const solidToastId = displayToast(nextToast)
  const displayedAt = Date.now()

  console.debug(
    '[ToastQueue] Toast displayed with solid-toast ID:',
    solidToastId,
    'for toast:',
    nextToast.message,
  )

  // Update the queue item with the solid-toast ID and display timestamp
  setQueue((prevQueue) =>
    prevQueue.map((item, index) =>
      index === 0 ? { ...item, solidToastId, displayedAt } : item,
    ),
  )

  console.debug(
    '[ToastQueue] Toast will be auto-dismissed in:',
    nextToast.options.duration ?? 'never (manual dismiss only)',
    'ms',
  )
}

/**
 * Clear all toasts
 */
export function clear(): void {
  console.debug('[ToastQueue] Clearing all toasts')

  // Dismiss all solid-toasts
  queue().forEach((toastItem) => {
    if (toastItem.solidToastId !== undefined) {
      dismissToast(toastItem.solidToastId)
    }
  })

  setQueue([])
  lastTransitionTime = 0
}

/**
 * Get current toast (reactive)
 */
export function getCurrentToast() {
  return currentToast()
}

/**
 * Get queue status for debugging
 */
export function getStatus() {
  return {
    currentToast: currentToast(),
    queueLength: queue().length,
    isInTransition: isInTransition(),
    nextToast: queue()[0] ?? null,
    lastTransitionTime,
  }
}

/**
 * Update queue configuration
 */
export function updateConfig(newConfig: Partial<ToastQueueConfig>): void {
  config = { ...config, ...newConfig }
  console.debug('[ToastQueue] Configuration updated:', config)
}

/**
 * Utility function to create a ToastItem from basic parameters
 */
export function createToastItem(
  message: string,
  options: ToastItem['options'],
): ToastItem {
  const level = options.level || 'info'
  const priority = TOAST_PRIORITY[level]

  return {
    id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    message,
    options,
    timestamp: Date.now(),
    priority,
  }
}

/**
 * Manually initialize the queue manager (useful for testing or specific contexts)
 */
export function initQueue(): void {
  initializeQueueManager()
}

/**
 * Dispose the queue manager (cleanup)
 */
export function disposeQueue(): void {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
    console.debug('[ToastQueue] Stopped interval-based processing')
  }

  if (queueManagerDispose !== null) {
    queueManagerDispose()
    queueManagerDispose = null
  }
}
