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
  const { rawValue, setRawValue, finishTyping } = field

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    finishTyping()
    onBlur?.(e)

    // TODO: Avoid duplicating `finishTyping` logic here
    const nextValue = field.transform.toValue(e.target.value)
    onFieldChange?.(nextValue)
  }

  return (
    <input
      {...props}
      value={rawValue}
      onChange={(e) => setRawValue(e.target.value)}
      onBlur={handleOnBlur}
    />
  )
}
