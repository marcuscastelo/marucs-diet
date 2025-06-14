import { z } from 'zod'

import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  createClipboardSchemaFilter,
  useClipboard,
} from '~/sections/common/hooks/useClipboard'
import { deserializeClipboard } from '~/shared/utils/clipboardUtils'

/**
 * Shared clipboard copy/paste logic for meal/recipe editors.
 * @param options
 *   - acceptedClipboardSchema: zod schema for validation
 *   - getDataToCopy: function to get the data to copy
 *   - onPaste: function to handle parsed clipboard data
 */
export function useCopyPasteActions<T>({
  acceptedClipboardSchema,
  getDataToCopy,
  onPaste,
}: {
  acceptedClipboardSchema: z.ZodType<T>
  getDataToCopy: () => T
  onPaste: (data: T) => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const isClipboardValid = createClipboardSchemaFilter(acceptedClipboardSchema)
  const {
    clipboard: clipboardText,
    write: writeToClipboard,
    clear: clearClipboard,
  } = useClipboard({ filter: isClipboardValid })

  const handleCopy = () => {
    writeToClipboard(JSON.stringify(getDataToCopy()))
  }

  const handlePasteAfterConfirm = () => {
    const data = deserializeClipboard(clipboardText(), acceptedClipboardSchema)
    if (data === null) {
      throw new Error('Invalid clipboard data: ' + clipboardText())
    }
    onPaste(data)
    clearClipboard()
  }

  const handlePaste = () => {
    showConfirmModal({
      title: 'Colar itens',
      body: 'Tem certeza que deseja colar os itens?',
      actions: [
        { text: 'Cancelar', onClick: () => undefined },
        { text: 'Colar', primary: true, onClick: handlePasteAfterConfirm },
      ],
    })
  }

  const hasValidPastableOnClipboard = () => isClipboardValid(clipboardText())

  return {
    clipboardText,
    writeToClipboard,
    clearClipboard,
    handleCopy,
    handlePaste,
    hasValidPastableOnClipboard,
  }
}
