export function deepCopy<T extends object | undefined | null>(
  obj: T,
): NonNullable<T> | null {
  return JSON.parse(JSON.stringify(obj ?? null)) as NonNullable<T> | null
}
