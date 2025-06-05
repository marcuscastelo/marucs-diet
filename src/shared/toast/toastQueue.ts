/**
 * Toast Queue Manager
 *
 * Manages a queue of toasts to ensure only one toast is visible at a time,
 * with intelligent prioritization and deduplication.
 */

import { createSignal, createEffect } from 'solid-js'
import toast from 'solid-toast'
import {
  ToastItem,
  ToastQueueConfig,
  DEFAULT_QUEUE_CONFIG,
  TOAST_PRIORITY,
  ToastLevel,
} from './toastConfig'

// Global queue state
const [queue, setQueue] = createSignal<ToastItem[]>([])
const [currentToast, setCurrentToast] = createSignal<ToastItem | null>(null)
const [isProcessing, setIsProcessing] = createSignal(false)
let config: ToastQueueConfig = { ...DEFAULT_QUEUE_CONFIG }
let processingTimeout: number | null = null

// Auto-process queue when current toast changes
createEffect(() => {
  if (!currentToast() && !isProcessing() && queue().length > 0) {
    processNext()
  }
})

/**
 * Display a toast in solid-toast with the appropriate styling
 */
function displayToast(message: string, level: ToastLevel): void {
  switch (level) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'warning':
      // solid-toast doesn't have warning, use custom or error styling
      toast(message, {
        style: {
          background: '#f59e0b',
          color: 'white',
        },
      })
      break
    case 'info':
    default:
      toast(message)
      break
  }
}

/**
 * Check for duplicate messages to avoid spam
 */
function isDuplicateToast(newToast: ToastItem): boolean {
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
export function enqueue(toast: ToastItem): string {
  if (isDuplicateToast(toast)) {
    console.debug('[ToastQueue] Duplicate toast ignored:', toast.message)
    return toast.id
  }

  // Manage queue size
  const currentQueue = queue()
  if (currentQueue.length >= config.maxQueueSize) {
    // Remove lowest priority toast
    const sorted = sortByPriority(currentQueue)
    sorted.pop() // Remove last (lowest priority)
    setQueue(sorted)
  }

  // Add new toast and sort by priority
  const newQueue = [...queue(), toast]
  setQueue(sortByPriority(newQueue))

  console.debug(
    '[ToastQueue] Toast enqueued:',
    toast.message,
    'ID:',
    toast.id,
    'Queue length:',
    newQueue.length,
  )

  // Process immediately if no toast is currently showing
  if (!currentToast() && !isProcessing()) {
    processNext()
  }

  return toast.id
}

/**
 * Remove current toast and process next in queue
 */
export function dequeue(): void {
  const current = currentToast()
  if (current) {
    console.debug('[ToastQueue] Dequeuing current toast:', current.message)
    setCurrentToast(null)
    setIsProcessing(true)

    // Wait for transition delay before showing next toast
    if (processingTimeout !== null) {
      clearTimeout(processingTimeout)
    }

    processingTimeout = window.setTimeout(() => {
      setIsProcessing(false)
      processNext()
    }, config.transitionDelay)
  }
}

/**
 * Remove a specific toast by ID from queue or current toast
 */
export function dequeueById(toastId: string): boolean {
  const current = currentToast()

  // Check if the toast to remove is currently displayed
  if (current?.id === toastId) {
    console.debug(
      '[ToastQueue] Dequeuing current toast by ID:',
      toastId,
      current.message,
    )
    setCurrentToast(null)
    setIsProcessing(true)

    // Wait for transition delay before showing next toast
    if (processingTimeout !== null) {
      clearTimeout(processingTimeout)
    }

    processingTimeout = window.setTimeout(() => {
      setIsProcessing(false)
      processNext()
    }, config.transitionDelay)

    return true
  }

  // Otherwise, remove from queue
  const currentQueue = queue()
  const toastIndex = currentQueue.findIndex((toast) => toast.id === toastId)

  if (toastIndex >= 0) {
    const removedToast = currentQueue[toastIndex]
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
  if (isProcessing() || currentToast()) {
    return
  }

  const currentQueue = queue()
  if (currentQueue.length === 0) {
    return
  }

  const nextToast = currentQueue[0]
  const remainingQueue = currentQueue.slice(1)

  setQueue(remainingQueue)
  setCurrentToast(nextToast)

  console.debug('[ToastQueue] Processing next toast:', nextToast.message)

  // Actually display the toast
  displayToast(nextToast.message, nextToast.options.level)

  // Auto-dismiss if duration is set
  const duration = nextToast.options.duration
  if (duration !== undefined && duration !== null && duration > 0) {
    if (processingTimeout !== null) {
      clearTimeout(processingTimeout)
    }

    processingTimeout = window.setTimeout(() => {
      // Dequeue current toast and process next
      setCurrentToast(null)
      setIsProcessing(true)

      setTimeout(() => {
        setIsProcessing(false)
        processNext()
      }, config.transitionDelay)
    }, duration)
  }
}

/**
 * Clear all toasts
 */
export function clear(): void {
  console.debug('[ToastQueue] Clearing all toasts')
  setQueue([])
  setCurrentToast(null)
  setIsProcessing(false)

  if (processingTimeout !== null) {
    clearTimeout(processingTimeout)
    processingTimeout = null
  }
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
    isProcessing: isProcessing(),
    nextToast: queue()[0] ?? null,
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
  options: Partial<ToastItem['options']>,
): ToastItem {
  const level = options.level || 'info'
  const priority = TOAST_PRIORITY[level]

  return {
    id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    options: {
      context: 'user-action',
      level,
      showLoading: true,
      showSuccess: true,
      maxLength: 100,
      duration: level === 'error' || level === 'warning' ? 0 : 3000,
      dismissible: true,
      ...options,
    },
    timestamp: Date.now(),
    priority,
  }
}
