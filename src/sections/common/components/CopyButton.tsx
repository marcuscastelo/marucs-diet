import { JSXElement, Accessor } from 'solid-js'
import { CopyIcon } from '~/sections/common/components/icons/CopyIcon'

export type CopyButtonProps<T> = {
  onCopy: (value: T) => void
  value: Accessor<T>
}

export function CopyButton<T>(props: CopyButtonProps<T>): JSXElement {
  return (
    <div
      class={'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        props.onCopy(props.value())
      }}
    >
      <CopyIcon />
    </div>
  )
}
