'use client'

import { useCallback, useState } from 'react'

export type FieldTransform<T> = {
  toField: (value: T) => string
  fromField: (value: string) => T
}

export const floatTransform: FieldTransform<number> = {
  toField: (value: number) => value.toFixed(2),
  fromField: (value: string) => parseFloat(value.replace(',', '.')),
}

// Any T except string
export function useField<T>({
  initialValue,
  transform,
}: {
  initialValue?: T
  transform: FieldTransform<T>
}) {
  const [rawValue, setRawValue] = useState<string>(
    initialValue === undefined ? '' : transform.toField(initialValue),
  )

  const [value, setValue] = useState<T | undefined>(initialValue)

  const handleSetRawValue = useCallback((value: string) => {
    setRawValue(value)
    // setRawValue(tranform.toField(tranform.fromField(value)))
  }, [])

  const handleFinishTyping = useCallback(() => {
    console.debug(`[useField] updateValue: ${rawValue}`)

    const newValue = transform.fromField(rawValue)
    const newRawValue = transform.toField(newValue)

    console.debug(`[useField] newValue: ${newValue}`)
    setValue(transform.fromField(rawValue))

    console.debug(`[useField] newRawValue: ${newRawValue}`)
    setRawValue(transform.toField(transform.fromField(rawValue)))
  }, [rawValue, transform])

  return {
    rawValue,
    setRawValue: handleSetRawValue,
    value,
    finishTyping: handleFinishTyping,
    transform,
  }
}

export const useFloatField = (initialValue?: number) =>
  useField<number>({
    initialValue,
    transform: floatTransform,
  })
