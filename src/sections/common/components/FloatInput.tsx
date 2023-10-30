'use client'

import { useFloatField } from '@/sections/common/hooks/useField'
import {
  ChangeEvent,
  DetailedHTMLProps,
  FocusEventHandler,
  InputHTMLAttributes,
} from 'react'

export function FloatInput({
  field,
  commitOn = 'blur',
  onFieldCommit,
  onBlur,
  ...props
}: {
  field: ReturnType<typeof useFloatField>
  commitOn?: 'blur' | 'change' /* | 'timeout' */
  onFieldCommit?: (value: number | undefined) => void
} & Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  'value' | 'onChange'
>) {
  const { rawValue, value, transform } = field

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e)

    if (commitOn === 'blur') {
      onFieldCommit?.(value.value)
      rawValue.value = transform.toRaw(value.value ?? 0)
    }
  }

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    rawValue.value = e.target.value

    if (commitOn === 'change') {
      onFieldCommit?.(value.value)
    }
  }

  return (
    <input
      {...props}
      value={rawValue.value}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  )
}
