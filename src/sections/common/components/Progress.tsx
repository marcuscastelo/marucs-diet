// https://flowbite.com/docs/components/progress/

import { cn } from '@/legacy/utils/cn'
import { Show, mergeProps } from 'solid-js'

// Usage:
// <Progress
//         class=""
//         size="sm"
//         textLabelPosition="outside"
//         color="red"
//         textLabel={`Proteína (${Math.round(props.macros.protein * 100) / 100}/${Math.round(props.targetMacros.protein * 100) / 100
//           }g)`}
//         labelText={true}
//         progress={(100 * props.macros.protein) / props.targetMacros.protein}
//       />

export function Progress (props_: {
  class?: string
  sizeClass?: `h-${string}`
  textLabelPosition?: 'outside' | 'inside'
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'gray' | 'indigo' | 'purple' | 'pink'
  textLabel?: string
  labelText?: boolean
  progress?: number
}) {
  const props = mergeProps({
    class: '',
    sizeClass: 'h-1.5',
    textLabelPosition: 'outside',
    color: 'blue',
    textLabel: '',
    labelText: false,
    progress: 50
  }, props_)

  const progressOver100 = () => props.progress > 100
  const progress = () => Math.max(0, Math.min(100, props.progress))

  const colorInnerClasses = () => ({
    // Red
    'bg-red-600': props.color === 'red',
    'dark:bg-red-500': props.color === 'red',

    // Green
    'bg-green-600': props.color === 'green',
    'dark:bg-green-500': props.color === 'green',

    // Blue
    'bg-blue-600': props.color === 'blue',
    'dark:bg-blue-500': props.color === 'blue',

    // Yellow
    'bg-yellow-600': props.color === 'yellow',
    'dark:bg-yellow-500': props.color === 'yellow',

    // Gray
    'bg-gray-600': props.color === 'gray',
    'dark:bg-gray-500': props.color === 'gray',

    // Indigo
    'bg-indigo-600': props.color === 'indigo',
    'dark:bg-indigo-500': props.color === 'indigo',

    // Purple
    'bg-purple-600': props.color === 'purple',
    'dark:bg-purple-500': props.color === 'purple'
  })

  const over100Classes = () => ({
    'text-rose-600 dark:text-red-500 animate-pulse font-extrabold uppercase': progressOver100()
  })

  return (
    <>
      <Show when={props.textLabelPosition === 'outside'}>
        <div class="flex justify-between mt-1">
          <span class={
            cn('text-base font-medium text-blue-700 dark:text-white',
              over100Classes())}>{props.textLabel}</span>
        </div>
      </Show>
      <div
        class={
          cn(
            'w-full bg-gray-200 rounded-full dark:bg-gray-700',
            props.sizeClass,
            props.class
          )
        }>
        <div
          class={
            cn(
              'bg-blue-600 rounded-full dark:bg-blue-500',
              props.sizeClass,
              colorInnerClasses(),
              over100Classes()
            )
          }
          style={{ width: `${progress()}%` }}
        >
          <Show when={props.textLabelPosition === 'inside'} >
            <div class={cn(over100Classes)} />
            {props.textLabel}
          </Show>
        </div>
      </div>
    </>
  )
}
