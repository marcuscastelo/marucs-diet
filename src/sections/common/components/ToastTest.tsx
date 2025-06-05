/**
 * Toast Test Component
 * Component para testar o sistema de toast com ID-based management
 */

import { Component } from 'solid-js'
import {
  showPromise,
  showSuccess,
  showError,
} from '~/shared/toast/toastManager'

const ToastTest: Component = () => {
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
      </div>
    </div>
  )
}

export default ToastTest
