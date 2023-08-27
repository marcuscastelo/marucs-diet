export type Identifiable = { id: number }

export function renegerateId<T extends Identifiable>(obj: T): T {
  return { ...obj, id: Math.round(Math.random() * 1000000) }
}
