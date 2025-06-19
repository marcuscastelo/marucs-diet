import { createSignal } from 'solid-js'

import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  copyConsoleLogsToClipboard,
  downloadConsoleLogsAsFile,
  getConsoleLogs,
  shareConsoleLogs,
} from '~/shared/console/consoleInterceptor'

export function ConsoleDumpButton() {
  const [processing, setProcessing] = createSignal(false)
  const { show: showConfirmModal } = useConfirmModalContext()

  const handleAction = async (action: 'copy' | 'download' | 'share') => {
    try {
      setProcessing(true)
      const logs = getConsoleLogs()

      if (logs.length === 0) {
        showError('Nenhum log de console encontrado')
        return
      }

      switch (action) {
        case 'copy':
          await copyConsoleLogsToClipboard()
          showSuccess(`${logs.length} logs copiados para o clipboard`)
          break
        case 'download':
          downloadConsoleLogsAsFile()
          showSuccess(`${logs.length} logs salvos em arquivo`)
          break
        case 'share':
          await shareConsoleLogs()
          showSuccess(`${logs.length} logs compartilhados`)
          break
      }
    } catch (error) {
      console.error(
        `Erro ao ${action === 'copy' ? 'copiar' : action === 'download' ? 'salvar' : 'compartilhar'} logs do console:`,
        error,
      )

      if (
        action === 'share' &&
        error instanceof Error &&
        error.message.includes('Share API')
      ) {
        showError(
          'Compartilhamento não suportado neste dispositivo. Tente copiar ou salvar.',
        )
      } else {
        showError(
          `Erro ao ${action === 'copy' ? 'copiar' : action === 'download' ? 'salvar' : 'compartilhar'} logs do console`,
        )
      }
    } finally {
      setProcessing(false)
    }
  }

  const openConsoleModal = () => {
    const logs = getConsoleLogs()

    if (logs.length === 0) {
      showError('Nenhum log de console encontrado')
      return
    }

    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const actions: Array<{
      text: string
      onClick: () => void
      primary?: boolean
    }> = [
      {
        text: '📋 Copiar',
        onClick: () => void handleAction('copy'),
      },
      {
        text: '💾 Salvar',
        onClick: () => void handleAction('download'),
      },
    ]

    // Add share option only on mobile devices
    if (isMobile) {
      actions.push({
        text: '📤 Compartilhar',
        primary: true,
        onClick: () => void handleAction('share'),
      })
    } else {
      // Make copy primary on desktop
      actions[0]!.primary = true
    }

    showConfirmModal({
      title: 'Console Logs',
      body: `${logs.length} logs encontrados. Como deseja exportar?`,
      actions,
      hasBackdrop: true,
    })
  }

  return (
    <button
      type="button"
      class="btn cursor-pointer uppercase btn-secondary btn-xs"
      onClick={openConsoleModal}
      disabled={processing()}
      title="Exportar logs do console"
    >
      {processing() ? 'Processando...' : '📋 Console'}
    </button>
  )
}
