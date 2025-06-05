/**
 * Toast Test Component
 * Component para testar o sistema de toast com ID-based management
 */

import { Component, createSignal } from 'solid-js'
import {
  showPromise,
  showSuccess,
  showError,
} from '~/shared/toast/toastManager'
import { smartToastPromise, smartToastPromiseDetached } from '~/shared/toast'

const ToastTest: Component = () => {
  const [showLoading, setShowLoading] = createSignal(true)
  const [showSuccess, setShowSuccess] = createSignal(true)

  const testPromiseSuccess = () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('Sucesso!'), 2000)
    })

    showPromise(
      promise,
      {
        loading: 'Carregando...',
        success: 'Operação concluída com sucesso!',
        error: 'Erro na operação',
      },
      'user-action',
    ).catch((err) => {
      console.error('Erro ao processar promise:', err)
    })
  }

  const testPromiseError = () => {
    const promise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Erro simulado')), 2000)
    })

    showPromise(
      promise,
      {
        loading: 'Processando...',
        success: 'Sucesso!',
        error: 'Falha na operação',
      },
      'user-action',
    ).catch((err) => {
      console.error('Erro ao processar promise:', err)
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
        loading: 'Carregando sem success message...',
        // Sem success message para testar se loading toast é removido corretamente
      },
      'user-action',
    ).catch((err) => {
      console.error('Erro ao processar promise sem mensagem de sucesso:', err)
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
        ...(showSuccess() && { success: 'Detached operation completed!' }),
        ...(showLoading() && { loading: 'Detached operation...' }),
        error: 'Detached operation failed',
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
        ...(showLoading() && { loading: 'Loading user data...' }),
        error: 'Failed to load user data',
        ...(showSuccess() && { success: 'User data loaded!' }),
      },
    )

    smartToastPromiseDetached(
      new Promise((resolve) => setTimeout(() => resolve('Settings'), 1500)),
      {
        context: 'background',
        ...(showLoading() && { loading: 'Loading settings...' }),
        error: 'Failed to load settings',
        ...(showSuccess() && { success: 'Settings loaded!' }),
      },
    )

    smartToastPromiseDetached(
      new Promise((resolve) => setTimeout(() => resolve('Cache'), 800)),
      {
        context: 'background',
        ...(showLoading() && { loading: 'Refreshing cache...' }),
        error: 'Failed to refresh cache',
        ...(showSuccess() && { success: 'Cache refreshed!' }),
      },
    )

    console.log('All detached operations started')
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
              checked={showLoading()}
              onInput={(e) => setShowLoading(e.currentTarget.checked)}
            />
            showLoading
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSuccess()}
              onInput={(e) => setShowSuccess(e.currentTarget.checked)}
            />
            showSuccess
          </label>
        </div>

        <button
          onClick={() => {
            testSmartToastPromise().catch(() => {})
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
