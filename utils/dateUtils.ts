export const getToday = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

//TODO: | Date is correct?
export const stringToDate = (day: string | Date) => new Date(`${day}T00:00:00`);