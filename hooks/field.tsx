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
  tranform,
}: {
  initialValue?: T
  tranform: FieldTransform<T>
}) {
  const [rawValue, setRawValue] = useState<string>(
    initialValue === undefined ? '' : tranform.toField(initialValue),
  )

  const [value, setValue] = useState<T | undefined>(initialValue)

  const handleSetRawValue = useCallback((value: string) => {
    setRawValue(value)
    // setRawValue(tranform.toField(tranform.fromField(value)))
  }, [])

  const handleFinishTyping = useCallback(() => {
    console.debug(`[useField] updateValue: ${rawValue}`)

    const newValue = tranform.fromField(rawValue)
    const newRawValue = tranform.toField(newValue)

    console.debug(`[useField] newValue: ${newValue}`)
    setValue(tranform.fromField(rawValue))

    console.debug(`[useField] newRawValue: ${newRawValue}`)
    setRawValue(tranform.toField(tranform.fromField(rawValue)))
  }, [rawValue, tranform])

  return {
    rawValue,
    setRawValue: handleSetRawValue,
    value,
    finishTyping: handleFinishTyping,
  }
}

export const useFloatField = (initialValue?: number) =>
  useField<number>({
    initialValue,
    tranform: floatTransform,
  })
