export const paths = {
  HOME: '/',
  TODAY: '/day',
  DAY: '/day/[dayId]',
} as const

export type PathName = keyof typeof paths
export type Path = (typeof paths)[PathName]
