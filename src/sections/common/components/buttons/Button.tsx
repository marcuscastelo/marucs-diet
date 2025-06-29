import { JSX, splitProps } from 'solid-js'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'
export type ButtonVariant = 'primary' | 'ghost' | 'error' | 'base'

export type ButtonProps = {
  size?: ButtonSize
  variant?: ButtonVariant
  fullWidth?: boolean
  noAnimation?: boolean
  loading?: boolean
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Base button component with standardized styling and behavior.
 * Provides consistent button appearance across the application.
 */
export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    'size',
    'variant',
    'fullWidth',
    'noAnimation',
    'loading',
    'disabled',
    'class',
    'children',
  ])

  const sizeClasses = () => {
    switch (local.size) {
      case 'xs':
        return 'btn-xs'
      case 'sm':
        return 'btn-sm'
      case 'lg':
        return 'btn-lg'
      default:
        return ''
    }
  }

  const variantClasses = () => {
    switch (local.variant) {
      case 'primary':
        return 'btn-primary'
      case 'ghost':
        return 'btn-ghost'
      case 'error':
        return 'btn-error'
      default:
        return ''
    }
  }

  const baseClasses = () => {
    const classes = ['btn', 'cursor-pointer', 'uppercase']

    if (local.fullWidth) {
      classes.push('w-full')
    }

    if (local.noAnimation) {
      classes.push('no-animation')
    }

    const sizeClass = sizeClasses()
    if (sizeClass) {
      classes.push(sizeClass)
    }

    const variantClass = variantClasses()
    if (variantClass) {
      classes.push(variantClass)
    }

    if (local.class) {
      classes.push(local.class)
    }

    return classes.join(' ')
  }

  return (
    <button
      {...others}
      class={baseClasses()}
      disabled={local.disabled || local.loading}
      aria-disabled={local.disabled || local.loading}
    >
      {local.loading ? 'Carregando...' : local.children}
    </button>
  )
}
