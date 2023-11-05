// TODO: Split useField in more files

import {
  adjustToTimezone,
  dateToString,
  stringToDate,
} from '@/legacy/utils/dateUtils'
import { createSignal, type Accessor, createEffect } from 'solid-js'

// TODO: Unit test all FieldTransforms
export type FieldTransform<T> = {
  toRaw: (value: T) => string
  toValue: (value: string) => T
}

export const createFloatTransform = (
  decimalPlaces?: number,
  defaultValue?: number,
  maxValue?: number,
): FieldTransform<number> => ({
  toRaw: (value: number) =>
    Math.min(value, maxValue ?? value).toFixed(decimalPlaces ?? 2),
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
      return Math.min(maxValue ?? defaultValue ?? 0, defaultValue ?? 0)
    }
    return Math.min(maxValue ?? fixedOrNan, fixedOrNan)
  },
})

export const createDateTransform = (): FieldTransform<Date> => ({
  toRaw: (value) => dateToString(value),
  toValue: (value) => {
    const date = adjustToTimezone(new Date(stringToDate(value)))
    return date
  },
})

export function useField<T>({
  inputSignal,
  transform,
}: {
  inputSignal: Accessor<T | undefined>
  transform: FieldTransform<T>
}) {
  const initialValue = inputSignal()
  const [rawValue, setRawValue] = createSignal(
    initialValue === undefined ? '' : transform.toRaw(initialValue),
  )

  createEffect(() => {
    const newValue = inputSignal()
    if (newValue === undefined) {
      setRawValue('')
    } else {
      setRawValue(transform.toRaw(newValue))
    }
  })

  const value = () => {
    const raw = rawValue()
    return raw === '' ? undefined : transform.toValue(raw)
  }

  return {
    rawValue,
    setRawValue,
    value,
    transform,
  }
}

/**
 * @deprecated Use useFloatField instead
 */
export const useFloatFieldOld = (
  initialValue: number | undefined = undefined,
  extras?: {
    decimalPlaces?: number
    defaultValue?: number
  },
) => {
  const [adapterSignal] = createSignal(initialValue)
  return useField<number>({
    inputSignal: adapterSignal,
    transform: createFloatTransform(
      extras?.decimalPlaces,
      extras?.defaultValue,
    ),
  })
}

export const useFloatField = (
  inputSignal?: Accessor<number | undefined>,
  extras?: {
    decimalPlaces?: number
    defaultValue?: number
    maxValue?: number
  },
) =>
  useField<number>({
    inputSignal: inputSignal ?? (() => undefined),
    transform: createFloatTransform(
      extras?.decimalPlaces,
      extras?.defaultValue,
      extras?.maxValue,
    ),
  })

export const useDateField = (inputSignal: Accessor<Date | undefined>) =>
  useField<Date>({
    inputSignal,
    transform: createDateTransform(),
  })
