import { type Accessor } from 'solid-js'
import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'

export interface PreparedQuantityProps {
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
   * @param newPreparedQuantity - The new prepared quantity entered by the user
   * @param newMultiplier - The calculated new multiplier based on the new prepared quantity
   */
  onPreparedQuantityChange: (newPreparedQuantity: number | null, newMultiplier: number) => void
  
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
    <div class="flex gap-2">
      <FloatInput
        field={preparedQuantityField}
        commitOn="change"
        class="input px-0 pl-5 text-md"
        onFocus={(event) => {
          event.target.select()
        }}
        onFieldCommit={(newPreparedQuantity) => {
          const newMultiplier = (newPreparedQuantity ?? props.rawQuantity) / props.rawQuantity
          props.onPreparedQuantityChange(newPreparedQuantity, newMultiplier ?? 1)
        }}
        style={{ width: '100%', ...props.style }}
      />
    </div>
  )
}
