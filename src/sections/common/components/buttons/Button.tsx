import { type JSX } from 'solid-js'

import { cn } from '~/shared/cn'

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Standardized button component with DaisyUI classes.
 * Use DaisyUI classes directly: btn, btn-primary, btn-ghost, btn-error, btn-xs, btn-sm, btn-lg, w-full, no-animation
 */
export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      type={props.type || 'button'}
      class={cn(
        'btn cursor-pointer uppercase active:scale-105 hover:scale-105 ',
        props.class,
      )}
    >
      {props.children}
    </button>
  )
}
