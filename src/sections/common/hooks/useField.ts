/**
 * @fileoverview Core useField hook for managing form field state and transformations
 */

import { createSignal, createEffect, type Accessor } from 'solid-js'
import type { FieldTransform } from './transforms/fieldTransforms'
import { createFloatTransform, createDateTransform } from './transforms/fieldTransforms'

export interface UseFieldOptions<T> {
  inputSignal: Accessor<T | undefined>
  transform: FieldTransform<T>
}

export interface UseFieldReturn<T> {
  rawValue: Accessor<string>
  setRawValue: (value: string) => void
  value: Accessor<T | undefined>
  transform: FieldTransform<T>
}

/**
 * Generic hook for managing form fields with type transformations
 * 
 * @param options Configuration for the field
 * @returns Field state and setters
 * 
 * @example
 * ```tsx
 * const field = useField({
 *   inputSignal: () => someNumber,
 *   transform: createFloatTransform({ decimalPlaces: 2 })
 * })
 * 
 * return <input 
 *   value={field.rawValue()} 
 *   onInput={(e) => field.setRawValue(e.target.value)} 
 * />
 * ```
 */
export function useField<T>({
  inputSignal,
  transform,
}: UseFieldOptions<T>): UseFieldReturn<T> {
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

  const value = (): T | undefined => {
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
 * Hook for managing float/number input fields
 * 
 * @param inputSignal Signal providing the current value
 * @param extras Configuration options for the float field
 * @returns Field state and handlers for float inputs
 * 
 * @example
 * ```tsx
 * const heightField = useFloatField(() => measure.height, {
 *   decimalPlaces: 1,
 *   maxValue: 300
 * })
 * 
 * return <FloatInput field={heightField} />
 * ```
 */
export function useFloatField(
  inputSignal?: Accessor<number | undefined>,
  extras?: {
    decimalPlaces?: number
    defaultValue?: number
    maxValue?: number
  }
) {
  return useField<number>({
    inputSignal: inputSignal ?? (() => undefined),
    transform: createFloatTransform(extras || {}),
  })
}

/**
 * Hook for managing date input fields
 * 
 * @param inputSignal Signal providing the current date value
 * @returns Field state and handlers for date inputs
 * 
 * @example
 * ```tsx
 * const dateField = useDateField(() => measure.target_timestamp)
 * 
 * return <Datepicker 
 *   value={dateField.value()} 
 *   onChange={(date) => dateField.setRawValue(dateField.transform.toRaw(date))} 
 * />
 * ```
 */
// Overload signatures
export function useDateField(
  inputSignal: Accessor<Date | undefined>,
  options: { fallback: () => Date }
): Omit<ReturnType<typeof useField<Date>>, 'value'> & { value: () => Date }
export function useDateField(
  inputSignal: Accessor<Date | undefined>,
  options?: undefined
): Omit<ReturnType<typeof useField<Date>>, 'value'> & { value: () => Date | undefined }
// Implementation
export function useDateField(
  inputSignal: Accessor<Date | undefined>,
  options?: { fallback?: () => Date }
): Omit<ReturnType<typeof useField<Date>>, 'value'> & { value: () => Date | undefined } {
  const field = useField<Date>({
    inputSignal,
    transform: createDateTransform(),
  })
  const valueWithFallback = () => {
    const v = field.value()
    if (v !== undefined) return v
    if (options?.fallback) return options.fallback()
    return undefined
  }
  return {
    ...field,
    value: valueWithFallback,
  }
}
