import { JSX, splitProps } from 'solid-js'

import {
  Button,
  ButtonProps,
} from '~/sections/common/components/buttons/Button'

export type ErrorButtonProps = Omit<ButtonProps, 'variant'>

/**
 * Error button component with standard error/danger styling.
 * Used for destructive actions like delete, remove, clear operations.
 */
export function ErrorButton(props: ErrorButtonProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <Button
      {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      variant="error"
      class={local.class}
    />
  )
}
