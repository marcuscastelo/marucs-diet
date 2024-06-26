export const getTodayYYYMMDD = () => dateToYYYYMMDD(getToday())
export const getToday = () => adjustToTimezone(getMidnight(new Date()))

export const adjustToTimezone = (date: Date) => {
  const offset = date.getTimezoneOffset() / 60
  const hours = date.getHours()
  const newDate = new Date(date)
  newDate.setHours(hours - offset)
  return newDate
}

export const getMidnight = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

// TODO: Is | Date correct?
export const stringToDate = (
  day: string | Date,
  extras?: {
    keepTime?: boolean
  },
) => {
  const date = new Date(day)

  if (extras?.keepTime === undefined || extras.keepTime) {
    return date
  }

  const dateString = dateToYYYYMMDD(date)
  return new Date(`${dateString}T00:00:00Z`)
}

export const dateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0]

export const dateToDDMM = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${day}/${month}`
}

export const dateToString = (date: Date) => date.toISOString()
