'use client'

import {
  adjustToTimezone,
  dateToYYYYMMDD,
  dateToString,
  stringToDate,
} from '@/utils/dateUtils'
import { SetStateAction, useCallback, useState } from 'react'

// TODO: Unit test all FieldTransforms
export type FieldTransform<T> = {
  toRaw: (value: T) => string
  toValue: (value: string) => T
}

export const createFloatTransform = (
  decimalPlaces?: number,
  defaultValue?: number,
): FieldTransform<number> => ({
  toRaw: (value: number) => value.toFixed(decimalPlaces ?? 2),
  toValue: (value: string) => {
    const noCommas = value.replace(/,/g, '.')
    const noMultipleDots = noCommas.replace(/\.(?=.*\.)/g, '')
    const noMultipleMinus = noMultipleDots.replace(/-/g, '')
    const noMultiplePlus = noMultipleMinus.replace(/\+/g, '')
    const noMultipleSpaces = noMultiplePlus.replace(/\s/g, '')
    const noMultipleZeros = noMultipleSpaces.replace(/^0+(?=\d)/g, '')

    const fixedOrNan = parseFloat(
      parseFloat(noMultipleZeros).toFixed(decimalPlaces ?? 2),
    )

    if (isNaN(fixedOrNan)) {
      return defaultValue ?? 0
    }
    return fixedOrNan
  },
})

export const createDateTransform = (): FieldTransform<Date> => ({
  toRaw: (value) => dateToString(value),
  toValue: (value) => {
    const date = adjustToTimezone(new Date(stringToDate(value)))
    return date
  },
})

// Any T except string
export function useField<T>({
  initialValue,
  transform,
}: {
  initialValue?: T
  transform: FieldTransform<T>
}) {
  const [rawValue, setRawValue] = useState<string>(
    initialValue === undefined ? '' : transform.toRaw(initialValue),
  )

  const [value, setValue] = useState<T | undefined>(initialValue)

  const handleSetValue = useCallback(
    (actionOrValue: T | SetStateAction<T | undefined>) => {
      if (actionOrValue instanceof Function) {
        setValue((oldValue) => {
          const newValue = actionOrValue(oldValue)
          const newRawValue =
            newValue !== undefined ? transform.toRaw(newValue) : ''
          const newValueFromRawValue = transform.toValue(newRawValue)
          const newRawValueFromNewValue = transform.toRaw(newValueFromRawValue)
          setRawValue(newRawValueFromNewValue)
          return newValueFromRawValue
        })
        return
      }

      const newValue = actionOrValue

      const newRawValue =
        newValue === undefined ? '' : transform.toRaw(newValue)

      const newValueFromRawValue = transform.toValue(newRawValue)
      setValue(newValueFromRawValue)
      const newRawValueFromNewValue = transform.toRaw(newValueFromRawValue)
      setRawValue(newRawValueFromNewValue)
    },
    [transform],
  )

  const handleFinishTyping = useCallback(() => {
    console.debug(`[useField] updateValue: ${rawValue}`)

    const newValue = transform.toValue(rawValue)
    const newRawValue = transform.toRaw(newValue)

    console.debug(`[useField] newValue: ${newValue}`)
    setValue(transform.toValue(rawValue))

    console.debug(`[useField] newRawValue: ${newRawValue}`)
    setRawValue(transform.toRaw(transform.toValue(rawValue)))
  }, [rawValue, transform])

  return {
    rawValue,
    setRawValue,
    value,
    setValue: handleSetValue,
    finishTyping: handleFinishTyping,
    transform,
  }
}

export const useFloatField = (
  initialValue: number | undefined = undefined,
  extras?: {
    decimalPlaces?: number
    defaultValue?: number
  },
) =>
  useField<number>({
    initialValue,
    transform: createFloatTransform(
      extras?.decimalPlaces,
      extras?.defaultValue,
    ),
  })

export const useDateField = (initialValue: Date | undefined = undefined) =>
  useField<Date>({
    initialValue,
    transform: createDateTransform(),
  })
