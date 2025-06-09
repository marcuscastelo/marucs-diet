import { For, useContext } from 'solid-js'
import { generateArrayNumber } from '~/sections/datepicker/helpers'
import { RoundedButton } from '~/sections/datepicker/components/utils'

import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'

type Props = {
  year: number
  currentYear: number
  minYear: number | null
  maxYear: number | null
  clickYear: (data: number) => void
}

const Years = (props: Props) => {
  const datepickerStore = useContext(DatepickerContext)

  const startDate = () => {
    switch (datepickerStore().dateLooking) {
      case 'backward':
        return props.year - 11
      case 'middle':
        return props.year - 4
      case 'forward':
      default:
        return props.year
    }
  }

  const endDate = () => {
    switch (datepickerStore().dateLooking) {
      case 'backward':
        return props.year
      case 'middle':
        return props.year + 7
      case 'forward':
      default:
        return props.year + 11
    }
  }

  return (
    <div class="w-full grid grid-cols-2 gap-2 mt-2">
      <For each={generateArrayNumber(startDate(), endDate())}>
        {((item, _index) => (
          <RoundedButton
            padding="py-3"
            onClick={() => {
              props.clickYear(item)
            }}
            active={props.currentYear === item}
            disabled={
              (props.maxYear !== null && item > props.maxYear) || (props.minYear !== null && item < props.minYear)
            }
          >
            <>{item}</>
          </RoundedButton>
        ))}
      </For>
    </div>
  )
}

export default Years
