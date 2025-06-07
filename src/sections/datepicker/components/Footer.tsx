import dayjs from 'dayjs'

import { DATE_FORMAT } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'

import { PrimaryButton, SecondaryButton } from '~/sections/datepicker/components/utils'
import { useContext } from 'solid-js'

const Footer = () => {
  // Contexts!
  const datepickerStore =
    useContext(DatepickerContext)

  // Functions
  const getClassName = () => {
    const {
      classNames
    } = datepickerStore()
    if (typeof classNames !== 'undefined' && typeof classNames?.footer === 'function') {
      return classNames.footer()
    }

    return 'flex items-center justify-end pb-2.5 pt-3 border-t border-gray-300 dark:border-gray-700'
  }

  return (
    <div class={getClassName()}>
      <div class="w-full md:w-auto flex items-center justify-center space-x-3">
        <SecondaryButton
          onClick={() => {
            const {
              hideDatepicker
            } = datepickerStore()
            hideDatepicker()
          }}
        >
          { /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-non-null-assertion */}
          <>{datepickerStore().configs?.footer?.cancel ? datepickerStore().configs!.footer!.cancel! : 'Cancel'}</>
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            const { hideDatepicker, period, changeDatepickerValue } = datepickerStore()
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (period.start && period.end) {
              changeDatepickerValue({
                startDate: dayjs(period.start).format(DATE_FORMAT),
                endDate: dayjs(period.end).format(DATE_FORMAT)
              })
              hideDatepicker()
            }
          }}
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          disabled={!(datepickerStore().period.start && datepickerStore().period.end)}
        >
          { /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-non-null-assertion */}
          <>{datepickerStore().configs?.footer?.apply ? datepickerStore().configs!.footer!.apply! : 'Apply'}</>
        </PrimaryButton>
      </div>
    </div>
  )
}

export default Footer
