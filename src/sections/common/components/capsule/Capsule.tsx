import { type JSXElement } from 'solid-js'

export default function Capsule (props: {
  leftContent: JSXElement
  rightContent: JSXElement
  className?: string
}) {
  return (
    <div
      class={`flex flex-col sm:flex-row gap-2 sm:gap-0 overflow-visible mt-10 sm:mt-0 ${
        props.className ?? ''
      }`}
    >
      <div
        class={'flex flex-1 flex-col justify-around bg-slate-700 text-left rounded-3xl sm:rounded-r-none'}
      >
        {props.leftContent}
      </div>
      <div
        class={'flex flex-1 flex-col justify-around bg-slate-900 text-left rounded-3xl sm:rounded-l-none'}
      >
        {props.rightContent}
      </div>
    </div>
  )
}
