'use client'

import { useFloatField } from '@/hooks/field'
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
  const { rawValue, setRawValue, finishTyping } = field

  const commit = (newValue: string) => {
    const nextValue = field.transform.toValue(newValue)
    onFieldCommit?.(nextValue)
  }

  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    // TODO: Avoid duplicating `finishTyping` logic here
    finishTyping()
    onBlur?.(e)

    if (commitOn === 'blur') {
      commit(e.target.value)
    }
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(e.target.value)

    if (commitOn === 'change') {
      commit(e.target.value)
    }
  }

  return (
    <input
      {...props}
      value={rawValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  )
}
