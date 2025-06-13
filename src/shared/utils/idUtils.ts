export type Identifiable = { id: number }

/**
 * @deprecated Probably should be done by database
 */
export function generateId(): number {
  return Math.round(Math.random() * 1000000)
}

/**
 * @deprecated Probably should be done by database
 */
export function regenerateId<T extends Identifiable>(obj: T): T {
  return { ...obj, id: generateId() }
}
