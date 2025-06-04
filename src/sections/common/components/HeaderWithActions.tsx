import { JSXElement, Show } from 'solid-js'

export type HeaderWithActionsProps = {
  name: JSXElement
  primaryActions?: JSXElement
  secondaryActions?: JSXElement
}

export function HeaderWithActions(props: HeaderWithActionsProps): JSXElement {
  return (
    <div class="flex">
      <div class="my-2">{props.name}</div>
      <div class="ml-auto flex flex-col">
        <Show when={props.secondaryActions}>
          <div class="my-auto">{props.secondaryActions}</div>
        </Show>
        <Show when={props.primaryActions}>
          <div class="ml-auto flex gap-2">
            <div class="my-auto">{props.primaryActions}</div>
          </div>
        </Show>
      </div>
    </div>
  )
}
