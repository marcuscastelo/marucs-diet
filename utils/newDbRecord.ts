export type New<T> = Omit<T, 'id' | '__type'>

export function enforceNew<T extends { id: unknown; __type: unknown }>(
  object: New<T>,
): New<T> {
  const copy = { ...object }
  delete (copy as Partial<T>).id
  delete (copy as Partial<T>).__type

  return copy
}
