import { JSXElement } from 'solid-js'

export type HeaderWithActionsAndCopyProps = {
  name: JSXElement
  copyButton?: JSXElement
  actions?: JSXElement
}

export function HeaderWithActionsAndCopy(
  props: HeaderWithActionsAndCopyProps,
): JSXElement {
  return (
    <div class="flex">
      <div class="my-2">{props.name}</div>
      <div class={'ml-auto flex gap-2'}>
        <div class="my-auto">{props.copyButton}</div>
        <div class="my-auto">{props.actions}</div>
      </div>
    </div>
  )
}
