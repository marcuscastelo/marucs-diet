/**
 * @deprecated use DAO instead
 */
export type DbReady<T> = Omit<T, 'id' | '__type'>
/**
 * @deprecated use DAO instead
 */
export type New<T> = Omit<T, 'id'>

export function enforceDbReady<T extends { id: unknown; __type: unknown }>(
  object: DbReady<T>,
): DbReady<T> {
  const copy = { ...object }
  delete (copy as Partial<T>).id
  delete (copy as Partial<T>).__type

  return copy
}

export function enforceNew<T extends { id: unknown }>(object: New<T>): New<T> {
  const copy = { ...object }
  delete (copy as Partial<T>).id

  return copy
}
