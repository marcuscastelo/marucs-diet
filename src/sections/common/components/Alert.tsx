import { cn } from '@/legacy/utils/cn'
import { type JSXElement, mergeProps } from 'solid-js'

// https://flowbite.com/docs/components/alerts/
export function Alert(props_: {
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  class?: string
  children?: JSXElement
}) {
  const props = mergeProps({ color: 'blue', class: '' }, props_)
  return (
    <div
      class={cn(
        'flex items-center p-4 mb-4 text-sm border rounded-lg',
        props.class,
        {
          'text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 border-blue-300 dark:border-blue-800':
            props.color === 'blue',
          'text-green-800 dark:text-green-400 bg-green-50 dark:bg-gray-800 border-green-300 dark:border-green-800':
            props.color === 'green',
          'text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-gray-800 border-yellow-300 dark:border-yellow-800':
            props.color === 'yellow',
          'text-red-800 dark:text-red-400 bg-red-50 dark:bg-gray-800 border-red-300 dark:border-red-800':
            props.color === 'red',
          'text-gray-800 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600':
            props.color === 'gray',
        },
      )}
      role="alert"
    >
      <svg
        class="flex-shrink-0 inline w-4 h-4 mr-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span class="sr-only">Info</span>
      <div>{props.children}</div>
    </div>
  )
}
