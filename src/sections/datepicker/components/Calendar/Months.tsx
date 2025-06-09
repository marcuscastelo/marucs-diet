import { For, useContext } from 'solid-js'
import dayjs from 'dayjs'

import { MONTHS } from '~/sections/datepicker/constants'
import DatepickerContext from '~/sections/datepicker/contexts/DatepickerContext'
import { loadLanguageModule } from '~/sections/datepicker/helpers'
import { RoundedButton } from '~/sections/datepicker/components/utils'

type Props = {
  currentMonth: number
  clickMonth: (month: number) => void
}

const Months = (props: Props) => {
  const datepickerStore = useContext(DatepickerContext)
  loadLanguageModule(datepickerStore().i18n)
  return (
        <div class="w-full grid grid-cols-2 gap-2 mt-2">
            <For each={MONTHS}>{item => (
                <RoundedButton
                    padding="py-3"
                    onClick={() => {
                      props.clickMonth(item)
                    }}
                    active={props.currentMonth === item}
                >
                    <>{dayjs(`2022-${item}-01`).locale(datepickerStore().i18n).format('MMM')}</>
                </RoundedButton>
            )}</For>
        </div>
  )
}

export default Months
