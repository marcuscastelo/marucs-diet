export type Identifiable = { id: number }

export function generateId(): number {
  return Math.round(Math.random() * 1000000)
}

export function renegerateId<T extends Identifiable>(obj: T): T {
  return { ...obj, id: generateId() }
}
