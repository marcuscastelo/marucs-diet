/**
 * Toast Test Component
 * Component to test the toast system with ID-based management
 */

import { Component, createSignal } from 'solid-js'
import {
  showPromise,
  showSuccess,
  showError,
  showLoading,
} from '~/shared/toast/toastManager'
import { ToastOptions } from '~/shared/toast/toastConfig'
import toast from 'solid-toast'

const ToastTest: Component = () => {
  const [toastOptions, setToastOptions] = createSignal<
    Partial<ToastOptions> & Pick<ToastOptions, 'context'>
  >({
    context: 'user-action',
    showLoading: true,
    showSuccess: true,
  })

  const testPromiseSuccess = () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('Success!'), 2000)
    })

    void showPromise(
      promise,
      {
        loading: 'Loading...',
        success: 'Operation completed successfully!',
        error: 'Error in operation',
      },
      { context: 'user-action' },
    ).catch((err) => {
      console.error('Error processing promise:', err)
    })
  }

  const testPromiseError = () => {
    const promise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Simulated error')), 2000)
    })

    void showPromise(
      promise,
      {
        loading: 'Processing...',
        success: 'Success!',
        error: 'Operação falhou\nPor favor, tente novamente.',
      },
      { context: 'user-action' },
    ).catch((err) => {
      console.error('Error processing promise:', err)
    })
  }

  const testPromiseWithoutMessages = () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('OK'), 1500)
    })

    void showPromise(
      promise,
      {
        loading: 'Loading without success message...',
        // No success message to test if loading toast is removed correctly
      },
      { context: 'user-action' },
    ).catch((err) => {
      console.error('Error processing promise without success message:', err)
    })
  }

  const testSmartToastPromise = async () => {
    try {
      console.log('Starting showPromise test...')
      const result = await showPromise(
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('Data loaded!'), 2000)
        }),
        {
          loading: 'Loading with showPromise...',
          success: 'Smart toast completed!',
          error: 'Smart toast failed',
        },
        { context: 'user-action' },
      )
      console.log('showPromise result:', result)
    } catch (error) {
      console.error('showPromise error:', error)
    }
  }

  const testSmartToastPromiseDetached = () => {
    console.log('Starting showPromise test...')

    void showPromise(
      new Promise<string>((resolve) => {
        setTimeout(() => {
          console.log('Detached operation completed!')
          resolve('Detached data loaded!')
        }, 2000)
      }),
      {
        loading: 'Detached operation...',
        success: 'Detached operation completed!',
        error: 'Operação destacada falhou\nPor favor, tente novamente.',
      },
      { context: 'user-action' },
    )

    console.log('showPromise called - continuing immediately')
  }

  const testMultipleDetachedOperations = () => {
    console.log('Testing multiple detached operations...')

    void showPromise(
      new Promise((resolve) => setTimeout(() => resolve('User data'), 1000)),
      {
        loading: 'Loading user data...',
        success: 'User data loaded!',
        error: 'Falha ao carregar dados do usuário\nTente novamente.',
      },
      { context: 'background' },
    )

    void showPromise(
      new Promise((resolve) => setTimeout(() => resolve('Settings'), 1500)),
      {
        loading: 'Loading settings...',
        success: 'Settings loaded!',
        error: 'Falha ao carregar configurações\nTente novamente.',
      },
      { context: 'background' },
    )

    void showPromise(
      new Promise((resolve) => setTimeout(() => resolve('Cache'), 800)),
      {
        loading: 'Refreshing cache...',
        success: 'Cache refreshed!',
        error: 'Falha ao atualizar cache\nTente novamente.',
      },
      { context: 'background' },
    )

    console.log('All detached operations started')
  }

  const testLongError = () => {
    const longMessage = `This is a very long error message that will demonstrate the truncation capability of our toast system. It contains multiple sentences and will definitely exceed the maximum length allowed for display in a toast. When this happens, the message will be truncated and an option to view the complete details will be provided to the user. This helps keep the UI clean while still allowing users to access the full error information if they need it. The error details modal will display this entire message along with any stack trace or context information that may be available.`
    showError(new Error(longMessage), { context: 'user-action' })
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
        {/* Failed promise for Promise without messages */}
        <button onClick={testPromiseWithoutMessages}>
          Test Promise without Success Message
        </button>
        <button
          onClick={() => {
            const promise = new Promise<string>((_, reject) => {
              setTimeout(
                () => reject(new Error('Simulated error (no success message)')),
                1500,
              )
            })
            void showPromise(
              promise,
              {
                loading: 'Loading without success message...',
                // No success message to test if loading toast is removed correctly
                error: 'Operação falhou\nPor favor, tente novamente.',
              },
              { context: 'user-action' },
            ).catch((err) => {
              console.error(
                'Error processing promise without success message:',
                err,
              )
            })
          }}
        >
          Test Promise without Success Message (error)
        </button>
        <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />
        <h3 style={{ margin: '10px 0 5px 0', 'font-size': '16px' }}>
          New showPromise Tests
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
          Test showPromise (awaitable)
        </button>
        <button
          onClick={() => {
            void (async () => {
              try {
                await showPromise(
                  new Promise<string>((_, reject) => {
                    setTimeout(
                      () => reject(new Error('Simulated error (showPromise)')),
                      2000,
                    )
                  }),
                  {
                    loading: 'Loading with showPromise...',
                    success: 'Smart toast completed!',
                    error: 'Smart toast failed (error)',
                  },
                  { context: 'user-action' },
                )
              } catch (error) {
                console.error('showPromise error:', error)
              }
            })()
          }}
          style={{ 'background-color': '#E53935', color: 'white' }}
        >
          Test showPromise (error)
        </button>
        <button
          onClick={testSmartToastPromiseDetached}
          style={{ 'background-color': '#2196F3', color: 'white' }}
        >
          Test showPromise (fire & forget)
        </button>
        <button
          onClick={() => {
            void showPromise(
              new Promise<string>((_, reject) => {
                setTimeout(
                  () => reject(new Error('Simulated error (detached)')),
                  2000,
                )
              }),
              {
                loading: 'Detached operation...',
                success: 'Detached operation completed!',
                error: 'Operação destacada falhou\nPor favor, tente novamente.',
              },
              { context: 'user-action' },
            )
          }}
          style={{ 'background-color': '#E53935', color: 'white' }}
        >
          Test showPromise (error)
        </button>
        <button
          onClick={testMultipleDetachedOperations}
          style={{ 'background-color': '#FF9800', color: 'white' }}
        >
          Test Multiple Detached Ops (bootstrap scenario)
        </button>
        <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

        <button onClick={() => toast.error('Direct Toast', { duration: 2000 })}>
          Test Direct
        </button>

        <button
          onClick={() =>
            showSuccess('Simple Success Toast', { context: 'user-action' })
          }
        >
          Test Simple Success
        </button>

        <button
          onClick={() =>
            showLoading('Loading operation...', { context: 'user-action' })
          }
        >
          Test Simple Loading
        </button>

        <button
          onClick={() =>
            showError(new Error('Simple error test'), {
              context: 'user-action',
            })
          }
        >
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
          <strong>showPromise vs showPromise:</strong>
        </p>
        <ul>
          <li>
            <strong>showPromise:</strong> Returns Promise, can be awaited, use
            for user actions
          </li>
          <li>
            <strong>showPromise:</strong> Fire & forget, ideal for
            bootstrap/background ops
          </li>
          <li>Check browser console for execution logs</li>
        </ul>
      </div>
    </div>
  )
}

export default ToastTest
