import { JSX, mergeProps } from 'solid-js'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'
export type ButtonVariant = 'primary' | 'ghost' | 'error'

export type ButtonProps = {
  size?: ButtonSize
  variant?: ButtonVariant
  fullWidth?: boolean
  noAnimation?: boolean
  loading?: boolean
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Standardized button component with consistent styling across the application.
 * Supports multiple variants, sizes, and common button behaviors.
 */
export function Button(allProps: ButtonProps) {
  const props = mergeProps({ variant: 'ghost' as ButtonVariant }, allProps)

  const getVariantClass = () => {
    switch (props.variant) {
      case 'primary':
        return 'btn-primary'
      case 'ghost':
        return 'btn-ghost'
      case 'error':
        return 'btn-error'
      default:
        return 'btn-ghost'
    }
  }

  const getSizeClass = () => {
    switch (props.size) {
      case 'xs':
        return 'btn-xs'
      case 'sm':
        return 'btn-sm'
      case 'lg':
        return 'btn-lg'
      case 'md':
      default:
        return ''
    }
  }

  const buildClassName = () => {
    const classes = [
      'btn',
      'cursor-pointer',
      'uppercase',
      getVariantClass(),
      getSizeClass(),
    ]

    if (props.fullWidth === true) {
      classes.push('w-full')
    }

    if (props.noAnimation === true) {
      classes.push('no-animation')
    }

    if (props.class && props.class !== '') {
      classes.push(props.class)
    }

    return classes.filter(Boolean).join(' ')
  }

  return (
    <button
      {...props}
      class={buildClassName()}
      disabled={props.disabled === true || props.loading === true}
      aria-disabled={props.disabled === true || props.loading === true}
    >
      {props.children}
    </button>
  )
}
