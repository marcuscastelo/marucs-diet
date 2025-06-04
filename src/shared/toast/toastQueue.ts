/**
 * Toast Queue Manager
 * 
 * Manages a queue of toasts to ensure only one toast is visible at a time,
 * with intelligent prioritization and deduplication.
 */

import { createSignal, createEffect, onCleanup } from 'solid-js'
import { ToastItem, ToastQueueConfig, DEFAULT_QUEUE_CONFIG, TOAST_PRIORITY } from './toastConfig'

/**
 * Toast Queue Manager Class
 * Handles queuing, prioritization, and display control of toasts
 */
export class ToastQueue {
  private queue: ToastItem[] = []
  private [currentToast, setCurrentToast] = createSignal<ToastItem | null>(null)
  private [isProcessing, setIsProcessing] = createSignal(false)
  private config: ToastQueueConfig
  private processingTimeout: number | null = null

  constructor(config: Partial<ToastQueueConfig> = {}) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config }
    
    // Auto-process queue when current toast changes
    createEffect(() => {
      if (!this.currentToast() && !this.isProcessing()) {
        this.processNext()
      }
    })

    // Cleanup on component unmount
    onCleanup(() => {
      if (this.processingTimeout) {
        clearTimeout(this.processingTimeout)
      }
    })
  }

  /**
   * Add a toast to the queue
   */
  enqueue(toast: ToastItem): void {
    // Check for duplicate messages to avoid spam
    const isDuplicate = this.queue.some(
      (existingToast) => 
        existingToast.message === toast.message && 
        existingToast.options.level === toast.options.level
    )

    if (isDuplicate) {
      console.debug('[ToastQueue] Duplicate toast ignored:', toast.message)
      return
    }

    // Remove oldest toast if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      const removed = this.queue.shift()
      console.debug('[ToastQueue] Queue full, removed oldest toast:', removed?.message)
    }

    // Add toast with priority
    this.queue.push(toast)
    
    // Sort queue by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority)

    console.debug('[ToastQueue] Toast enqueued:', {
      message: toast.message,
      priority: toast.priority,
      queueLength: this.queue.length
    })

    // Process immediately if no toast is currently showing
    if (!this.currentToast() && !this.isProcessing()) {
      this.processNext()
    }
  }

  /**
   * Remove current toast and process next in queue
   */
  dequeue(): void {
    const current = this.currentToast()
    if (current) {
      console.debug('[ToastQueue] Dequeuing toast:', current.message)
      this.setCurrentToast(null)
      
      // Wait for transition delay before showing next toast
      this.processingTimeout = window.setTimeout(() => {
        this.setIsProcessing(false)
        this.processNext()
      }, this.config.transitionDelay)
    }
  }

  /**
   * Process next toast in queue
   */
  private processNext(): void {
    if (this.isProcessing() || this.currentToast()) {
      return
    }

    const nextToast = this.queue.shift()
    if (nextToast) {
      console.debug('[ToastQueue] Processing next toast:', nextToast.message)
      this.setIsProcessing(true)
      this.setCurrentToast(nextToast)
      
      // Auto-dequeue after duration if specified
      if (nextToast.options.duration && nextToast.options.duration > 0) {
        this.processingTimeout = window.setTimeout(() => {
          this.dequeue()
        }, nextToast.options.duration)
      }
    }
  }

  /**
   * Clear all toasts from queue
   */
  clear(): void {
    console.debug('[ToastQueue] Clearing all toasts')
    this.queue = []
    this.setCurrentToast(null)
    this.setIsProcessing(false)
    
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout)
      this.processingTimeout = null
    }
  }

  /**
   * Get current visible toast
   */
  getCurrentToast() {
    return this.currentToast()
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      currentToast: this.currentToast(),
      queueLength: this.queue.length,
      isProcessing: this.isProcessing(),
      nextToast: this.queue[0] || null
    }
  }

  /**
   * Update queue configuration
   */
  updateConfig(newConfig: Partial<ToastQueueConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.debug('[ToastQueue] Configuration updated:', this.config)
  }
}

/**
 * Utility function to create a ToastItem from basic parameters
 */
export function createToastItem(
  message: string,
  options: Partial<ToastItem['options']>
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
      ...options
    },
    timestamp: Date.now(),
    priority
  }
}

/**
 * Singleton instance for global toast queue management
 */
let globalToastQueue: ToastQueue | null = null

/**
 * Get or create the global toast queue instance
 */
export function getToastQueue(): ToastQueue {
  if (!globalToastQueue) {
    globalToastQueue = new ToastQueue()
  }
  return globalToastQueue
}

/**
 * Reset the global toast queue (mainly for testing)
 */
export function resetToastQueue(): void {
  if (globalToastQueue) {
    globalToastQueue.clear()
  }
  globalToastQueue = null
}
