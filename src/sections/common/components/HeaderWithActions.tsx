import { JSXElement, For } from 'solid-js'

export type HeaderWithActionsProps = {
  name: JSXElement
  actions?: JSXElement[]
  removeFromListButton?: JSXElement
}

export function HeaderWithActions(props: HeaderWithActionsProps): JSXElement {
  return (
    <div class="flex">
      <div class="my-2">{props.name}</div>
      <div class="ml-auto flex flex-col">
        <div class="my-auto">{props.removeFromListButton}</div>
        <div class="ml-auto flex gap-2">
          <For each={props.actions}>
            {(action) => <div class="my-auto">{action}</div>}
          </For>
        </div>
      </div>
    </div>
  )
}
