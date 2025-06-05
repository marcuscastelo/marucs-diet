/**
 * Toast Test Component
 * Component to test the toast system with ID-based management
 */

import { Component, createSignal } from 'solid-js'
import {
  showPromise,
  showSuccess,
  showError,
} from '~/shared/toast/toastManager'
import { smartToastPromise, smartToastPromiseDetached } from '~/shared/toast'

const ToastTest: Component = () => {
  const [toastOptions, setToastOptions] = createSignal({
    showLoading: true,
    showSuccess: true,
  })

  const testPromiseSuccess = () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('Success!'), 2000)
    })

    showPromise(
      promise,
      {
        loading: 'Loading...',
        success: 'Operation completed successfully!',
        error: 'Error in operation',
      },
      'user-action',
    ).catch((err) => {
      console.error('Error processing promise:', err)
    })
  }

  const testPromiseError = () => {
    const promise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Simulated error')), 2000)
    })

    showPromise(
      promise,
      {
        loading: 'Processing...',
        success: 'Success!',
        error: 'Operation failed',
      },
      'user-action',
    ).catch((err) => {
      console.error('Error processing promise:', err)
    })
  }

  const testMultipleToasts = () => {
    for (let i = 0; i < 10; i++) {
      showSuccess(`Toast ${i + 1}`)
    }
  }

  const testPromiseWithoutMessages = () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('OK'), 1500)
    })

    showPromise(
      promise,
      {
        loading: 'Loading without success message...',
        // No success message to test if loading toast is removed correctly
      },
      'user-action',
    ).catch((err) => {
      console.error('Error processing promise without success message:', err)
    })
  }

  const testSmartToastPromise = async () => {
    try {
      console.log('Starting smartToastPromise test...')
      const result = await smartToastPromise(
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('Data loaded!'), 2000)
        }),
        {
          context: 'user-action',
          loading: 'Loading with smartToastPromise...',
          success: 'Smart toast completed!',
          error: 'Smart toast failed',
        },
      )
      console.log('smartToastPromise result:', result)
    } catch (error) {
      console.error('smartToastPromise error:', error)
    }
  }

  const testSmartToastPromiseDetached = () => {
    console.log('Starting smartToastPromiseDetached test...')

    smartToastPromiseDetached(
      new Promise<string>((resolve) => {
        setTimeout(() => {
          console.log('Detached operation completed!')
          resolve('Detached data loaded!')
        }, 2000)
      }),
      {
        context: 'user-action',
        loading: 'Detached operation...',
        success: 'Detached operation completed!',
        error: 'Detached operation failed',
        options: toastOptions(),
      },
    )

    console.log('smartToastPromiseDetached called - continuing immediately')
  }

  const testMultipleDetachedOperations = () => {
    console.log('Testing multiple detached operations...')

    smartToastPromiseDetached(
      new Promise((resolve) => setTimeout(() => resolve('User data'), 1000)),
      {
        context: 'background',
        loading: 'Loading user data...',
        success: 'User data loaded!',
        error: 'Failed to load user data',
        options: toastOptions(),
      },
    )

    smartToastPromiseDetached(
      new Promise((resolve) => setTimeout(() => resolve('Settings'), 1500)),
      {
        context: 'background',
        loading: 'Loading settings...',
        success: 'Settings loaded!',
        error: 'Failed to load settings',
        options: toastOptions(),
      },
    )

    smartToastPromiseDetached(
      new Promise((resolve) => setTimeout(() => resolve('Cache'), 800)),
      {
        context: 'background',
        loading: 'Refreshing cache...',
        success: 'Cache refreshed!',
        error: 'Failed to refresh cache',
        options: toastOptions(),
      },
    )

    console.log('All detached operations started')
  }

  const testLongError = () => {
    const longMessage = `This is a very long error message that will demonstrate the truncation capability of our toast system. It contains multiple sentences and will definitely exceed the maximum length allowed for display in a toast. When this happens, the message will be truncated and an option to view the complete details will be provided to the user. This helps keep the UI clean while still allowing users to access the full error information if they need it. The error details modal will display this entire message along with any stack trace or context information that may be available.`
    showError(new Error(longMessage), 'user-action')
  }

  return (
    <div style={{ padding: '20px', 'font-family': 'sans-serif' }}>
      <h2>Toast System Test</h2>
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: '10px',
          'max-width': '300px',
        }}
      >
        <button onClick={testPromiseSuccess}>
          Test Promise Success (2s loading)
        </button>

        <button onClick={testPromiseError}>
          Test Promise Error (2s loading)
        </button>

        <button onClick={testMultipleToasts}>
          Test Multiple Toasts (Queue)
        </button>

        <button onClick={testPromiseWithoutMessages}>
          Test Promise without Success Message
        </button>

        <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

        <h3 style={{ margin: '10px 0 5px 0', 'font-size': '16px' }}>
          New smartToastPromiseDetached Tests
        </h3>

        <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={toastOptions().showLoading}
              onInput={(e) =>
                setToastOptions((o) => ({
                  ...o,
                  showLoading: e.currentTarget.checked,
                }))
              }
            />
            showLoading
          </label>
          <label>
            <input
              type="checkbox"
              checked={toastOptions().showSuccess}
              onInput={(e) =>
                setToastOptions((o) => ({
                  ...o,
                  showSuccess: e.currentTarget.checked,
                }))
              }
            />
            showSuccess
          </label>
        </div>

        <button
          onClick={() => {
            void testSmartToastPromise()
          }}
          style={{ 'background-color': '#4CAF50', color: 'white' }}
        >
          Test smartToastPromise (awaitable)
        </button>

        <button
          onClick={testSmartToastPromiseDetached}
          style={{ 'background-color': '#2196F3', color: 'white' }}
        >
          Test smartToastPromiseDetached (fire & forget)
        </button>

        <button
          onClick={testMultipleDetachedOperations}
          style={{ 'background-color': '#FF9800', color: 'white' }}
        >
          Test Multiple Detached Ops (bootstrap scenario)
        </button>

        <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

        <button onClick={() => showSuccess('Simple Success Toast')}>
          Test Simple Success
        </button>

        <button onClick={() => showError(new Error('Simple error test'))}>
          Test Simple Error
        </button>

        <button onClick={testLongError}>Test Long Error (truncate/copy)</button>
      </div>

      <div style={{ 'margin-top': '20px', 'font-size': '14px', color: '#666' }}>
        <p>
          <strong>Expected Behavior:</strong>
        </p>
        <ul>
          <li>Only 1 toast visible at a time</li>
          <li>Promise loading toasts should be replaced by success/error</li>
          <li>Multiple toasts should queue properly</li>
          <li>Loading toast should disappear when no success message</li>
        </ul>

        <p style={{ 'margin-top': '15px' }}>
          <strong>smartToastPromiseDetached vs smartToastPromise:</strong>
        </p>
        <ul>
          <li>
            <strong>smartToastPromise:</strong> Returns Promise, can be awaited,
            use for user actions
          </li>
          <li>
            <strong>smartToastPromiseDetached:</strong> Fire & forget, ideal for
            bootstrap/background ops
          </li>
          <li>Check browser console for execution logs</li>
        </ul>
      </div>
    </div>
  )
}

export default ToastTest
