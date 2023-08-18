export type New<T> = Omit<T, 'id' | ''>

export function enforceNew<T extends { id: unknown; '': unknown }>(
  object: New<T>,
): New<T> {
  const copy = { ...object }
  delete (copy as Partial<T>).id
  delete (copy as Partial<T>)['']

  return copy
}
