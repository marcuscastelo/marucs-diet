import { JSX, splitProps } from 'solid-js'

import {
  Button,
  ButtonProps,
} from '~/sections/common/components/buttons/Button'

export type GhostButtonProps = Omit<ButtonProps, 'variant'>

/**
 * Ghost button component with standard ghost/secondary styling.
 * Used for secondary actions like cancel, close, back operations.
 */
export function GhostButton(props: GhostButtonProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <Button
      {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      variant="ghost"
      class={local.class}
    />
  )
}
