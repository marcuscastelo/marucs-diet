import { type Accessor, type JSXElement } from 'solid-js'

import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'
import { COPY_BUTTON_STYLES } from '~/sections/common/styles/buttonStyles'

export type CopyButtonProps<T> = {
  onCopy: (value: T) => void
  value: Accessor<T>
  class?: string
  stopPropagation?: boolean
}

export function CopyButton<T>(props: CopyButtonProps<T>): JSXElement {
  const shouldStopPropagation = props.stopPropagation ?? true

  return (
    <div
      class={props.class ?? COPY_BUTTON_STYLES}
      onClick={(e) => {
        if (shouldStopPropagation) {
          e.stopPropagation()
          e.preventDefault()
        }
        props.onCopy(props.value())
      }}
    >
      <CopyIcon />
    </div>
  )
}
