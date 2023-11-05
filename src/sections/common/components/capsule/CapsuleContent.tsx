import { type JSXElement } from 'solid-js'

export function CapsuleContent(props: { children: JSXElement }) {
  return (
    <div class={'ml-2 p-2 text-xl flex justify-between'}>{props.children}</div>
  )
}
