// TODO:   remove id utils and find a way to generate ids in the database
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

/**
 * @deprecated Probably should be done by database
 */
export function addId<T extends Exclude<object, 'id'>>(
  obj: T,
): T & Identifiable {
  return { ...obj, id: generateId() }
}
