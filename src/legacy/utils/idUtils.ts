export type Identifiable = { id: number }

export function generateId(): number {
  return Math.round(Math.random() * 1000000)
}

export function regenerateId<T extends Identifiable>(obj: T): T {
  return { ...obj, id: generateId() }
}

/**
 * @deprecated Probably should be done by database
 */
export function addId<T extends Exclude<object, 'id'>>(
  obj: T,
): T & Identifiable {
  return { ...obj, id: generateId() }
}
