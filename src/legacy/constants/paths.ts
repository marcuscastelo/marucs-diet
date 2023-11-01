// TODO: Use paths constant (should be constructible from day id)
export const paths = {
  HOME: '/',
  TODAY: '/diet',
  DAY: '/diet/[dayId]'
} as const

export type PathName = keyof typeof paths
export type Path = (typeof paths)[PathName]
