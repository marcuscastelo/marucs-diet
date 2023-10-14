export const getToday = () => dateToYYYYMMDD(adjustToTimezone(new Date()))

export const adjustToTimezone = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000)
}

// TODO: retriggered: | Date is correct?
export const stringToDate = (
  day: string | Date,
  extras?: {
    keepTime?: boolean
  },
) => {
  const date = new Date(day)

  if (extras?.keepTime) {
    return date
  }

  const dateString = dateToYYYYMMDD(date)
  return new Date(`${dateString}T00:00:00`)
}

export const dateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0]

export const dateToDDMM = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${day}/${month}`
}

export const dateToString = (date: Date) => date.toISOString()
