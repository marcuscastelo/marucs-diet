// https://flowbite.com/docs/components/progress/

/**
 * Linear progress bar component for displaying progress visually.
 *
 * @param props - Progress bar properties
 * @param props.class - Additional CSS classes for the outer container
 * @param props.sizeClass - Height class for the progress bar (e.g., 'h-1.5')
 * @param props.textLabelPosition - Position of the label ('outside' or 'inside')
 * @param props.color - Color of the progress bar
 * @param props.textLabel - Optional label to display
 * @param props.labelText - Whether to show the label text
 * @param props.progress - Progress value (0-100)
 * @returns Linear progress bar JSX element
 */

import { mergeProps, Show } from 'solid-js'

import { cn } from '~/shared/cn'

export function Progress(props_: {
  class?: string
  sizeClass?: `h-${string}`
  labelClass?: string
  textLabelPosition?: 'outside' | 'inside'
  color?:
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'gray'
    | 'indigo'
    | 'purple'
    | 'pink'
  textLabel?: string
  showLabel?: boolean
  progress?: number
}) {
  const props = mergeProps(
    {
      class: '',
      sizeClass: 'h-1.5',
      textLabelPosition: 'outside',
      color: 'blue',
      textLabel: '',
      labelText: false,
      progress: 50,
    },
    props_,
  )

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
    'bg-blue-700': props.color === 'blue',
    'dark:bg-blue-600': props.color === 'blue',

    // Yellow
    'bg-yellow-600': props.color === 'yellow',
    'dark:bg-yellow-400': props.color === 'yellow',

    // Gray
    'bg-gray-600': props.color === 'gray',
    'dark:bg-gray-500': props.color === 'gray',

    // Indigo
    'bg-indigo-600': props.color === 'indigo',
    'dark:bg-indigo-500': props.color === 'indigo',

    // Purple
    'bg-purple-600': props.color === 'purple',
    'dark:bg-purple-500': props.color === 'purple',
  })

  const over100Classes = () => ({
    'text-rose-600 dark:text-red-500 animate-pulse font-extrabold uppercase':
      progressOver100(),
  })

  return (
    <>
      <Show when={props.textLabelPosition === 'outside'}>
        <div class="flex justify-between mt-1">
          <span
            class={cn(
              'text-base text-md font-medium text-blue-800 dark:text-white w-full',
              over100Classes(),
              props.labelClass,
            )}
          >
            {props.textLabel}
          </span>
        </div>
      </Show>
      <div
        class={cn(
          'w-full bg-gray-200 rounded-full dark:bg-gray-700',
          props.sizeClass,
          props.class,
        )}
      >
        <div
          class={cn(
            'bg-blue-700 rounded-full dark:bg-blue-600',
            props.sizeClass,
            colorInnerClasses(),
            over100Classes(),
          )}
          style={{ width: `${progress()}%` }}
        >
          <Show when={props.textLabelPosition === 'inside'}>
            <div class={cn(over100Classes)} />
            {props.textLabel}
          </Show>
        </div>
      </div>
    </>
  )
}
