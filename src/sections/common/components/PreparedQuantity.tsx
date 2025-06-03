import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { cn } from '~/shared/cn'
import { type Accessor, createMemo } from 'solid-js'

export type PreparedQuantityProps = {
  /**
   * The raw (unprepared) quantity value
   */
  rawQuantity: number

  /**
   * The prepared multiplier to calculate prepared quantity
   */
  preparedMultiplier: number

  /**
   * Callback called when the user commits a new prepared quantity value
   */
  onPreparedQuantityChange: (values: {
    /** The new prepared quantity entered by the user */
    newPreparedQuantity: Accessor<number | undefined>
    /** The calculated new multiplier based on the new prepared quantity */
    newMultiplier: Accessor<number>
    /** The calculated new raw quantity (newPreparedQuantity / preparedMultiplier) */
    newRawQuantity: Accessor<number>
  }) => void

  /**
   * Optional CSS class to apply to the container
   */
  class?: string

  /**
   * Optional style to apply to the input
   */
  style?: Record<string, string>
}

/**
 * A reusable component for editing prepared quantities.
 *
 * This component displays the current prepared quantity (rawQuantity * preparedMultiplier)
 * and allows the user to edit it directly. When the user changes the prepared quantity,
 * it calculates the new multiplier and calls the onPreparedQuantityChange callback.
 */
export function PreparedQuantity(props: PreparedQuantityProps) {
  const preparedQuantity = () => props.rawQuantity * props.preparedMultiplier

  const preparedQuantityField = useFloatField(preparedQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div class={cn('flex gap-2', props.class)}>
      <FloatInput
        field={preparedQuantityField}
        commitOn="change"
        class="input px-0 pl-5 text-md"
        onFocus={(event) => {
          event.target.select()
        }}
        onFieldCommit={(newPreparedQuantity) => {
          const newPreparedQuantityAccessor = () => newPreparedQuantity
          const newMultiplierAccessor = createMemo(
            () =>
              (newPreparedQuantity ?? props.rawQuantity) / props.rawQuantity,
          )
          const newRawQuantityAccessor = createMemo(
            () => (newPreparedQuantity ?? 0) / props.preparedMultiplier,
          )

          props.onPreparedQuantityChange({
            newPreparedQuantity: newPreparedQuantityAccessor,
            newMultiplier: newMultiplierAccessor,
            newRawQuantity: newRawQuantityAccessor,
          })
        }}
        style={{ width: '100%', ...props.style }}
      />
    </div>
  )
}
