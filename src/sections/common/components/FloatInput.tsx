'use client'

import { useFloatField } from '@/sections/common/hooks/useField'
import { FocusEventHandler } from 'react'

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
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'value' | 'onChange'
>) {
  const { rawValue, value } = field

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e)

    if (commitOn === 'blur') {
      onFieldCommit?.(value.value)
    }
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
