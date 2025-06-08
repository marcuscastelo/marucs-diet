import { JSXElement } from 'solid-js'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'

export type ClipboardActionButtonsProps = {
  canCopy: boolean
  canPaste: boolean
  canClear: boolean
  onCopy: () => void
  onPaste: () => void
  onClear: (e: MouseEvent) => void
}

export function ClipboardActionButtons(
  props: ClipboardActionButtonsProps,
): JSXElement {
  return (
    <div class={'ml-auto flex gap-2'}>
      {props.canCopy && (
        <div
          class={
            'btn-ghost btn cursor-pointer uppercase ml-auto mt-1 px-2 text-white hover:scale-105'
          }
          onClick={props.onCopy}
        >
          <CopyIcon />
        </div>
      )}
      {props.canPaste && (
        <div
          class={
            'btn-ghost btn cursor-pointer uppercase ml-auto mt-1 px-2 text-white hover:scale-105'
          }
          onClick={props.onPaste}
        >
          <PasteIcon />
        </div>
      )}
      {props.canClear && (
        <div
          class={
            'btn-ghost btn cursor-pointer uppercase ml-auto mt-1 px-2 text-white hover:scale-105'
          }
          onClick={props.onClear}
        >
          <TrashIcon />
        </div>
      )}
    </div>
  )
}
