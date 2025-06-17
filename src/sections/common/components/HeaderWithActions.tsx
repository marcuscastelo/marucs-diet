import { JSXElement, Show } from 'solid-js'

export type HeaderWithActionsProps = {
  name: JSXElement
  primaryActions?: JSXElement
  secondaryActions?: JSXElement
}

export function HeaderWithActions(props: HeaderWithActionsProps): JSXElement {
  return (
    <div class="flex justify-between items-center">
      <div class="">{props.name}</div>
      <div class="flex flex-col">
        <Show when={props.secondaryActions}>
          <div class="flex gap-2 items-center">{props.secondaryActions}</div>
        </Show>
        <Show when={props.primaryActions}>
          <div class="flex gap-2 items-center">{props.primaryActions}</div>
        </Show>
      </div>
    </div>
  )
}
