'use client'

import {
  adjustToTimezone,
  dateToYYYYMMDD,
  dateToString,
  stringToDate,
} from '@/utils/dateUtils'
import {
  ReadonlySignal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'
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

export function useField<T>({
  inputSignal,
  transform,
}: {
  inputSignal: ReadonlySignal<T | undefined>
  transform: FieldTransform<T>
}) {
  const rawValue = useSignal(
    inputSignal.value === undefined ? '' : transform.toRaw(inputSignal.value),
  )

  useSignalEffect(() => {
    if (inputSignal.value === undefined) {
      rawValue.value = ''
    } else {
      rawValue.value = transform.toRaw(inputSignal.value)
    }
  })

  const value = computed(() => {
    const raw = rawValue.value
    return raw === '' ? undefined : transform.toValue(raw)
  })

  return {
    rawValue,
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
  const adapterSignal = useSignal(initialValue)
  return useField<number>({
    inputSignal: adapterSignal,
    transform: createFloatTransform(
      extras?.decimalPlaces,
      extras?.defaultValue,
    ),
  })
}

export const useFloatField = (
  inputSignal: ReadonlySignal<number | undefined>,
  extras?: {
    decimalPlaces?: number
    defaultValue?: number
  },
) =>
  useField<number>({
    inputSignal,
    transform: createFloatTransform(
      extras?.decimalPlaces,
      extras?.defaultValue,
    ),
  })

export const useDateField = (inputSignal: ReadonlySignal<Date | undefined>) =>
  useField<Date>({
    inputSignal,
    transform: createDateTransform(),
  })
