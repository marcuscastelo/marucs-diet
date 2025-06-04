import { JSXElement } from 'solid-js'

export type HeaderWithActionsAndCopyProps = {
  name: JSXElement
  copyButton?: JSXElement
  actions?: JSXElement
  removeFromListButton?: JSXElement
}

export function HeaderWithActionsAndCopy(
  props: HeaderWithActionsAndCopyProps,
): JSXElement {
  return (
    <div class="flex">
      {/*
        // TODO: Item id is random, but it should be an entry on the database (meal too)
        // <h5 class="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.Item.id}]</h5>
      */}
      <div class="my-2">{props.name}</div>
      <div class="ml-auto flex flex-col">
        <div class="my-auto">{props.removeFromListButton}</div>
        <div class="ml-auto flex gap-2">
          <div class="my-auto">{props.copyButton}</div>
          <div class="my-auto">{props.actions}</div>
        </div>
      </div>
    </div>
  )
}
