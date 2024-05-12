import { type useFloatField } from '~/sections/common/hooks/useField'
import type JSX from 'solid-js/jsx-runtime'
export function FloatInput(
  props: {
    field: ReturnType<typeof useFloatField>
    commitOn?: 'blur' | 'change' /* | 'timeout' */
    onFieldCommit?: (value: number | undefined) => void
    onBlur?: (
      e: FocusEvent & {
        currentTarget: HTMLInputElement
        target: HTMLInputElement
      },
    ) => void
  } & JSX.JSX.InputHTMLAttributes<HTMLInputElement>,
) {
  const commitOn = () => props.commitOn ?? 'blur'

  const handleOnBlur = (
    e: FocusEvent & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    },
  ) => {
    props.onBlur?.(e)

    if (commitOn() === 'blur') {
      props.onFieldCommit?.(props.field.value())
      props.field.setRawValue(
        props.field.transform.toRaw(props.field.value() ?? 0),
      )
    }
  }

  const handleOnChange = (
    e: Event & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    },
  ) => {
    props.field.setRawValue(e.target.value)

    if (commitOn() === 'change') {
      props.onFieldCommit?.(props.field.value())
    }
  }

  return (
    <input
      {...props}
      value={props.field.rawValue()}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  )
}
