import { JSX, splitProps } from 'solid-js'

import {
  Button,
  ButtonProps,
} from '~/sections/common/components/buttons/Button'

export type PrimaryButtonProps = Omit<ButtonProps, 'variant'>

/**
 * Primary button component with standard primary styling.
 * Used for primary actions like save, submit, confirm operations.
 */
export function PrimaryButton(props: PrimaryButtonProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <Button
      {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      variant="primary"
      class={local.class}
    />
  )
}
