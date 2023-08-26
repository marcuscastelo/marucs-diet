'use client'

import { useFloatField } from '@/hooks/field'
import { FocusEventHandler, useEffect } from 'react'

export function FloatInput({
  field,
  onFieldChange,
  onBlur,
  ...props
}: {
  field: ReturnType<typeof useFloatField>
  onFieldChange?: (value: number | undefined) => void
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'value' | 'onChange'
>) {
  const { rawValue, setRawValue, finishTyping, value } = field

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    finishTyping()
    onBlur?.(e)
  }

  useEffect(() => {
    onFieldChange?.(value)
  }, [onFieldChange, value])

  return (
    <input
      {...props}
      type="number"
      value={rawValue}
      onChange={(e) => setRawValue(e.target.value)}
      onBlur={handleOnBlur}
    />
  )
}
