import {
  dateToYYYYMMDD,
  getToday,
  stringToDate,
} from '~/legacy/utils/dateUtils'
import { currentUser } from '~/modules/user/application/user'
import { createMemo } from 'solid-js'
import { logError } from '~/shared/error/errorHandler'
export const birthdayToday = createMemo(() => {
  const user_ = currentUser()
  if (user_ === null) {
    logError('user is null', {
      component: 'congratulateApplication',
      operation: 'birthdayToday',
      additionalData: {}
    })
    return false
  }

  const today = getToday()
  const birthday = stringToDate(user_.birthdate)

  console.debug(`[congratulate::application] today: ${dateToYYYYMMDD(today)}`)
  console.debug(
    `[congratulate::application] birthday: ${dateToYYYYMMDD(birthday)}`,
  )

  console.debug(
    `[congratulate::application] today.getMonth(): ${today.getMonth()}`,
  )
  console.debug(
    `[congratulate::application] birthday.getMonth(): ${birthday.getMonth()}`,
  )

  console.debug(
    `[congratulate::application] today.getDate(): ${today.getDate()}`,
  )
  console.debug(
    `[congratulate::application] birthday.getDate(): ${birthday.getDate()}`,
  )
  const sameMonth = today.getMonth() === birthday.getMonth()
  const sameDay = today.getDate() === birthday.getDate()
  console.debug(
    `[congratulate::application] sameMonth: ${sameMonth}. sameDay: ${sameDay}`,
  )
  return sameMonth && sameDay
})
